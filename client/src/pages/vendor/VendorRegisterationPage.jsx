import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { format } from 'date-fns';

import { signupSchema } from "@/schemas/authSchemas";
import api from "@/lib/axios";
import { fetchCountries, fetchStates, fetchCities } from "@/lib/location-api";

import Template from "@/components/auth/Template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // This is the required import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const OperatingHoursSelector = ({ field }) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const times = Array.from({ length: 48 }, (_, i) => { const h = Math.floor(i / 2), m = i % 2 === 0 ? "00" : "30"; return `${h.toString().padStart(2, '0')}:${m}`; });
    const currentHours = JSON.parse(field.value || '{}');
    const handleDayChange = (day, checked) => { const newHours = { ...currentHours }; if (checked) newHours[day] = { start: '09:00', end: '17:00' }; else delete newHours[day]; field.onChange(JSON.stringify(newHours)); };
    const handleTimeChange = (day, type, value) => { const newHours = { ...currentHours }; if (newHours[day]) { newHours[day][type] = value; field.onChange(JSON.stringify(newHours)); } };
    return ( <div className="space-y-3"> {days.map(day => ( <div key={day} className="flex items-center justify-between p-2 border rounded-md bg-white/50"> <div className="flex items-center space-x-2"> <Checkbox id={day} checked={!!currentHours[day]} onCheckedChange={(c) => handleDayChange(day, c)} /> <label htmlFor={day} className="text-sm font-medium">{day}</label> </div> {currentHours[day] && ( <div className="flex items-center gap-2"> <Select onValueChange={(v) => handleTimeChange(day, 'start', v)} defaultValue={currentHours[day].start}> <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger> <SelectContent>{times.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent> </Select> <span>to</span> <Select onValueChange={(v) => handleTimeChange(day, 'end', v)} defaultValue={currentHours[day].end}> <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger> <SelectContent>{times.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent> </Select> </div> )} </div> ))} </div>);
};

const VendorRegistrationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [verificationState, setVerificationState] = useState('verifying');
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [isStateLoading, setIsStateLoading] = useState(false);
    const [isCityLoading, setIsCityLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "VENDOR", businessName: "", phone: "", street: "", district: "", city: "", zipCode: "", country: "", operatingHours: "{}" },
    });
    
    const selectedCountry = form.watch("country");
    const selectedState = form.watch("city");

    useEffect(() => {
        if (!token) { setVerificationState('invalid'); return; }
        const verifyToken = async () => {
            try {
                const response = await api.get(`/invitations/verify/${token}`);
                form.setValue('email', response.data.email);
                setVerificationState('verified');
            } catch (error) { setVerificationState('invalid'); }
        };
        verifyToken();
    }, [token, form]);

    useEffect(() => { fetchCountries().then(setCountries); }, []);
    useEffect(() => { if (selectedCountry) { setIsStateLoading(true); form.setValue('city', ''); form.setValue('district', ''); setStates([]); setCities([]); fetchStates(selectedCountry).then(setStates).finally(() => setIsStateLoading(false)); } }, [selectedCountry, form]);
    useEffect(() => { if (selectedCountry && selectedState) { setIsCityLoading(true); form.setValue('district', ''); setCities([]); fetchCities(selectedCountry, selectedState).then(setCities).finally(() => setIsCityLoading(false)); } }, [selectedCountry, selectedState, form]);

    const handleNextStep = async (currentStep, fieldsToValidate) => {
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(currentStep + 1);
    };

    const onSubmit = async (data) => {
        const submissionData = { ...data, token, role: 'VENDOR' };
        try {
            await api.post('/auth/register', submissionData);
            toast.success("Registration successful! Please sign in.");
            navigate('/signin');
        } catch (error) { toast.error(error.response?.data?.message || "Registration failed."); }
    };
    
    const glassInputStyle = "bg-white/50 backdrop-blur-sm border border-emerald-300/30 shadow-sm focus:border-primary";
    const glassButtonStyle = "w-full font-bold bg-gradient-to-r from-emerald-500/80 to-teal-600/80 backdrop-blur-lg text-white border border-emerald-500/50 hover:opacity-90 transition-all shadow-lg hover:shadow-xl";
    
    const getHeaderText = () => {
      switch(step) {
          case 1: return { title: "Create Your Vendor Account", subtitle: "Welcome! Let's get started with the basics." };
          case 2: return { title: "Business Information", subtitle: "Tell us about your services." };
          case 3: return { title: "Business Location", subtitle: "Where can customers find you?" };
          default: return { title: "Vendor Registration", subtitle: "Please complete the steps." };
      }
    };
    const { title, subtitle } = getHeaderText();

    if (verificationState === 'verifying') return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
    if (verificationState === 'invalid') return <Template><div className="text-center"><AlertTriangle className="mx-auto h-12 w-12 text-red-500"/><h2 className="mt-4 text-2xl font-bold">Invalid Link</h2><p className="mt-2 text-muted-foreground">This registration link is invalid or has expired.</p><Link to="/signin"><Button className="mt-6">Back to Sign In</Button></Link></div></Template>;

    return (
        <Template>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">{title}</h2>
                <p className="text-muted-foreground mt-2">{subtitle}</p>
                <div className="flex items-center justify-center mt-6 space-x-2">
                    <div className={cn("w-12 h-2 rounded-full", step >= 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-200')} />
                    <div className={cn("w-12 h-2 rounded-full", step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-200')} />
                    <div className={cn("w-12 h-2 rounded-full", step === 3 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-200')} />
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {step === 1 && (
                        <>
                            <FormField name="name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Your Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField name="email" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input readOnly disabled {...field} className={`${glassInputStyle} cursor-not-allowed`} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField name="password" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><div className="relative"><Input type={showPassword ? "text" : "password"} {...field} className={glassInputStyle} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3"><Eye size={20} /></button></div></FormControl><FormMessage /></FormItem> )} />
                            <FormField name="confirmPassword" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? "text" : "password"} {...field} className={glassInputStyle} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3"><Eye size={20} /></button></div></FormControl><FormMessage /></FormItem> )} />
                            <Button type="button" onClick={() => handleNextStep(1, ['name', 'email', 'password', 'confirmPassword'])} className={glassButtonStyle}>Next</Button>
                        </>
                    )}

                    {step === 2 && (
                         <>
                            <FormField name="businessName" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField name="phone" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField name="operatingHours" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Operating Hours</FormLabel><FormControl><OperatingHoursSelector field={field} /></FormControl><FormMessage /></FormItem> )}/>
                            <div className="flex items-center gap-4 pt-4">
                                <Button type="button" onClick={() => handleNextStep(2, ['businessName', 'phone', 'operatingHours'])} className={`${glassButtonStyle} w-full`}>Next</Button>
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="w-full"><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
                            </div>
                         </>
                    )}

                    {step === 3 && (
                         <>
                            <FormField name="country" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={glassInputStyle}><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                            <FormField name="city" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Province / State</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedCountry || isStateLoading}><FormControl><SelectTrigger className={glassInputStyle}>{isStateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                            <FormField name="district" control={form.control} render={({ field }) => ( <FormItem><FormLabel>District / City</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedState || isCityLoading}><FormControl><SelectTrigger className={glassInputStyle}>{isCityLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                            <FormField name="street" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Street</FormLabel><FormControl><Input {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField name="zipCode" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem> )}/>
                            <div className="space-y-4 pt-4">
                                <Button type="submit" className={glassButtonStyle} disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Finish Registration</Button>
                            </div>
                            <div className="space-y-4 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="w-full">Back</Button>
                            </div>
                         </>
                    )}
                </form>
            </Form>
        </Template>
    );
};

export default VendorRegistrationPage;

