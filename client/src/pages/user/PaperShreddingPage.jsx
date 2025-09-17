import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ShieldCheck, Recycle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// --- Reusable Step Component for the process timeline ---
const ProcessStep = ({ icon: Icon, title, description, isLast }) => (
    <div className="flex">
        <div className="flex flex-col items-center mr-4">
            <div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-primary">
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {!isLast && <div className="w-px h-full bg-emerald-200" />}
        </div>
        <div className="pb-8">
            <p className="mb-2 text-xl font-bold text-gray-800">{title}</p>
            <p className="text-gray-600">{description}</p>
        </div>
    </div>
);


const PaperShreddingPage = () => {
    return (
        <AppLayout>
            <div>
                {/* --- Enhanced Header --- */}
                <div className="relative bg-white/70 backdrop-blur-lg border border-emerald-300/30 rounded-lg p-8 mb-10 overflow-hidden">
                     <div className="absolute top-0 right-0 -mt-20 -mr-20 text-emerald-500/5">
                        <FileText className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold text-gray-800">Secure Paper Shredding</h2>
                        <p className="text-slate-500 mt-2 max-w-2xl">
                            Ensure the confidentiality of your sensitive documents with our certified, industrial-grade shredding services. We provide a secure, compliant, and eco-friendly solution to protect your information.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Main Content Section --- */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-white/80 backdrop-blur-sm border-emerald-300/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl"><ShieldCheck className="text-emerald-500 h-7 w-7"/>Why It's Critical</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                                <p>Every document containing sensitive information—from financial records and client data to strategic business plans—poses a significant security risk if not disposed of correctly.</p>
                                <p>Our certified shredding process ensures your documents are irreversibly destroyed, protecting your organization from identity theft, costly data breaches, and corporate espionage, while ensuring compliance with privacy regulations.</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-white/80 backdrop-blur-sm border-emerald-300/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl"><Recycle className="text-emerald-500 h-7 w-7"/>Our Secure Process</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProcessStep
                                    icon={FileText}
                                    title="1. Secure Collection"
                                    description="We provide secure, locked collection bins at your location. Your documents are protected from the moment they are discarded until they are collected by our certified personnel."
                                />
                                <ProcessStep
                                    icon={ShieldCheck}
                                    title="2. Certified Destruction"
                                    description="Using industrial-grade, cross-cut shredders, we destroy your documents into fine, confetti-like particles, making them completely unreadable and impossible to reconstruct."
                                />
                                <ProcessStep
                                    icon={Recycle}
                                    title="3. Responsible Recycling"
                                    description="After destruction, 100% of the shredded material is securely transported to our recycling partners to be pulped and repurposed, contributing to a circular economy."
                                    isLast
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Sidebar / Call to Action --- */}
                    <div className="lg:col-span-1">
                         <Card className="bg-white/80 backdrop-blur-sm border-emerald-300/30 sticky top-24">
                            <CardHeader>
                                <CardTitle>Ready to Secure Your Documents?</CardTitle>
                                <CardDescription>
                                    Find a certified vendor near you to schedule a secure pickup.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link to="/user/find-vendor">
                                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow hover:opacity-95">
                                        Find a Vendor <ArrowRight className="h-4 w-4 ml-2"/>
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PaperShreddingPage;

