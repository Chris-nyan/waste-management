import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import { signupSchema } from "@/schemas/authSchemas";
import api from "@/lib/axios";
import { fetchCountries, fetchStates, fetchCities } from "@/lib/location-api";

import Template from "@/components/auth/Template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Helper component for Operating Hours
const OperatingHoursSelector = ({ field }) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const times = Array.from({ length: 48 }, (_, i) => {
        const hours = Math.floor(i / 2);
        const minutes = i % 2 === 0 ? "00" : "30";
        const formattedHours = hours.toString().padStart(2, '0');
        return `${formattedHours}:${minutes}`;
    });

    const currentHours = JSON.parse(field.value || '{}');

    const handleDayChange = (day, checked) => {
        const newHours = { ...currentHours };
        if (checked) {
            newHours[day] = { start: '09:00', end: '17:00' };
        } else {
            delete newHours[day];
        }
        field.onChange(JSON.stringify(newHours));
    };

    const handleTimeChange = (day, type, value) => {
        const newHours = { ...currentHours };
        if (newHours[day]) {
            newHours[day][type] = value;
            field.onChange(JSON.stringify(newHours));
        }
    };

    return (
        <div className="space-y-3">
            {days.map(day => (
                <div key={day} className="flex items-center justify-between p-2 border rounded-md bg-white/50">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={day}
                            checked={!!currentHours[day]}
                            onCheckedChange={(checked) => handleDayChange(day, checked)}
                        />
                        <label htmlFor={day} className="text-sm font-medium text-gray-700">{day}</label>
                    </div>
                    {currentHours[day] && (
                        <div className="flex items-center gap-2">
                             <Select onValueChange={(value) => handleTimeChange(day, 'start', value)} defaultValue={currentHours[day].start}>
                                <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{times.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                            <span className="text-xs">to</span>
                             <Select onValueChange={(value) => handleTimeChange(day, 'end', value)} defaultValue={currentHours[day].end}>
                                <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{times.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};


const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // State for location dropdowns
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isStateLoading, setIsStateLoading] = useState(false);
  const [isCityLoading, setIsCityLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "", email: "", password: "", confirmPassword: "", role: "USER",
      businessName: "", phone: "", street: "", district: "", city: "",
      zipCode: "", country: "", operatingHours: "{}", // Default to empty JSON object
    },
  });

  const role = form.watch("role");
  const selectedCountry = form.watch("country");
  const selectedState = form.watch("city"); // Using 'city' field for state/province

  // Fetch countries on component mount
  useEffect(() => {
    const getCountries = async () => {
      const countryList = await fetchCountries();
      setCountries(countryList);
    };
    getCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const getStates = async () => {
        setIsStateLoading(true);
        form.setValue('city', '');
        form.setValue('district', '');
        setStates([]);
        setCities([]);
        const stateList = await fetchStates(selectedCountry);
        setStates(stateList);
        setIsStateLoading(false);
      };
      getStates();
    }
  }, [selectedCountry, form.setValue]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const getCities = async () => {
        setIsCityLoading(true);
        form.setValue('district', '');
        setCities([]);
        const cityList = await fetchCities(selectedCountry, selectedState);
        setCities(cityList);
        setIsCityLoading(false);
      };
      getCities();
    }
  }, [selectedCountry, selectedState, form.setValue]);


  const handleNextStep = async (currentStep, fieldsToValidate) => {
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(currentStep + 1);
    }
  };
  
  const handleStep1Next = async () => {
      const isValid = await form.trigger(["name", "email", "password", "confirmPassword"]);
      if (isValid) {
          if (role === 'VENDOR') {
              setStep(2);
          } else {
              form.handleSubmit(onSubmit)();
          }
      }
  };


  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data);
      toast.success("Registration successful! Please sign in.");
      navigate('/signin');
    } catch (error) {
      const errorMessage = error instanceof AxiosError && error.response ?
        error.response.data.message : "An unexpected error occurred.";
      console.error("Registration error:", error);
      toast.error(errorMessage);
    }
  };
  
  const glassInputStyle = "bg-white/50 backdrop-blur-sm border border-emerald-300/30 shadow-sm focus:border-primary";
  const glassButtonStyle = "w-full font-bold bg-gradient-to-r from-emerald-500/80 to-teal-600/80 backdrop-blur-lg text-white border border-emerald-500/50 hover:opacity-90 transition-all shadow-lg hover:shadow-xl";

  const getHeaderText = () => {
      if (role !== 'VENDOR') return { title: "Create Your Account", subtitle: "Let's get started with the basics." };
      switch(step) {
          case 1: return { title: "Create Your Account", subtitle: "Let's get started with the basics." };
          case 2: return { title: "Business Information", subtitle: "Tell us about your services." };
          case 3: return { title: "Business Location", subtitle: "Where can customers find you?" };
          default: return {};
      }
  };

  const { title, subtitle } = getHeaderText();

  return (
    <Template>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
        {role === 'VENDOR' && (
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className={`w-12 h-2 rounded-full transition-all ${step >= 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-200'}`} />
            <div className={`w-12 h-2 rounded-full transition-all ${step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-200'}`} />
            <div className={`w-12 h-2 rounded-full transition-all ${step === 3 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-200'}`} />
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <>
              {/* --- STEP 1: Basic Info --- */}
              <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="email" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Email Address</FormLabel><FormControl><Input type="email" placeholder="name@example.com" {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="password" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Password</FormLabel><FormControl><div className="relative"><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className={glassInputStyle} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"><Eye size={20} /></button></div></FormControl><FormMessage /></FormItem>)} />
              <FormField name="confirmPassword" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Confirm Password</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} className={glassInputStyle} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"><Eye size={20} /></button></div></FormControl><FormMessage /></FormItem>)} />
              <FormField name="role" control={form.control} render={({ field }) => (<FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-white/50 backdrop-blur-sm border-emerald-300/30"><FormControl><Checkbox checked={field.value === 'VENDOR'} onCheckedChange={(checked) => field.onChange(checked ? 'VENDOR' : 'USER')} /></FormControl><div className="leading-none"><FormLabel className="font-semibold text-gray-700">Sign up as a Vendor</FormLabel></div></FormItem>)} />
              <Button type="button" onClick={handleStep1Next} className={glassButtonStyle}>{role === 'VENDOR' ? 'Next' : 'Create Account'}</Button>
            </>
          )}

          {step === 2 && role === 'VENDOR' && (
             <>
               {/* --- STEP 2: Business Info --- */}
                <FormField name="businessName" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Business Name</FormLabel><FormControl><Input placeholder="Eco Warriors Inc." {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField name="phone" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Phone Number</FormLabel><FormControl><Input placeholder="555-0101" {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField name="operatingHours" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Operating Hours</FormLabel><FormControl><OperatingHoursSelector field={field} /></FormControl><FormMessage /></FormItem>)}/>
                <div className="flex items-center gap-4 pt-4">
                  <Button type="button" onClick={() => handleNextStep(2, ['businessName', 'phone', 'operatingHours'])} className={`${glassButtonStyle} w-full`}>Next</Button>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} className="w-full text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
                </div>
                
             </>
          )}

          {step === 3 && role === 'VENDOR' && (
             <>
               {/* --- STEP 3: Location Info --- */}
                <FormField name="country" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={glassInputStyle}><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField name="city" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Province / State</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedCountry || isStateLoading}><FormControl><SelectTrigger className={glassInputStyle}>{isStateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<SelectValue placeholder="Select a province/state" /></SelectTrigger></FormControl><SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField name="district" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">District / City</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedState || isCityLoading}><FormControl><SelectTrigger className={glassInputStyle}>{isCityLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<SelectValue placeholder="Select a district/city" /></SelectTrigger></FormControl><SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField name="street" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Street</FormLabel><FormControl><Input placeholder="100 Recycling Rd" {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField name="zipCode" control={form.control} render={({ field }) => (<FormItem><FormLabel className="text-gray-600">Zip Code</FormLabel><FormControl><Input placeholder="10101" {...field} className={glassInputStyle} /></FormControl><FormMessage /></FormItem>)}/>
                
                <div className="space-y-4 pt-4">
                  <Button type="submit" className={glassButtonStyle} disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}</Button>
                </div>
                <div className="space-y-4 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(2)} className="w-full text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
                </div>
             </>
          )}

        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground mt-6">Already have an account? <Link to="/signin" className="font-semibold text-primary hover:underline">Sign in</Link></p>
    </Template>
  );
};

export default SignUpPage;

