import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, HardDrive, Award, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Enhanced, reusable card for the different destruction options
const ServiceOptionCard = ({ to, icon: Icon, title, description, features }) => (
    <Link to={to} className="block group rounded-lg">
        <Card className="bg-white/60 backdrop-blur-xl border border-white/30 h-full transition-all duration-300 group-hover:shadow-2xl group-hover:border-white/50 group-hover:-translate-y-2 relative overflow-hidden">
             {/* Subtle decorative background icon */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors duration-300">
                <Icon className="w-48 h-48" />
            </div>
            
            <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg mb-4">
                    <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl text-gray-800">{title}</CardTitle>
                <CardDescription className="pt-1 !text-gray-600">{description}</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
                <ul className="space-y-2 text-sm text-gray-700">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="relative z-10">
                 <div className="text-primary font-semibold flex items-center text-sm">
                    Learn More 
                    <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                 </div>
            </CardFooter>
        </Card>
    </Link>
);


const SecureDestructionPage = () => {
    return (
        <AppLayout>
            <div>
                <div className="mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/80 backdrop-blur-lg border border-emerald-300/30 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Secure Data Destruction</h2>
                            <p className="text-slate-500 mt-1">Certified solutions for your most sensitive information.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <ServiceOptionCard 
                        to="/user/secure-destruction/paper-shredding"
                        icon={FileText}
                        title="Paper Shredding"
                        description="For confidential documents."
                        features={["On-site & Off-site Service", "NAID AAA Certified", "Secure Chain of Custody"]}
                    />
                    <ServiceOptionCard 
                        to="/user/secure-destruciton/e-waste-destruction"
                        icon={HardDrive}
                        title="E-Waste Destruction"
                        description="For digital data & hardware."
                        features={["Certified Data Erasure", "Physical Hard Drive Shredding", "Eco-Friendly Recycling"]}
                    />
                    <ServiceOptionCard 
                        to="/user/secure-destruction/reporting"
                        icon={Award}
                        title="Reporting & Certification"
                        description="For compliance & peace of mind."
                        features={["Certificate of Destruction", "Detailed Asset Tracking", "Environmental Impact Reports"]}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default SecureDestructionPage;

