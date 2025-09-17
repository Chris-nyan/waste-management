import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HardDrive, ShieldCheck, Recycle, ArrowRight, DatabaseZap } from 'lucide-react';
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


const EWasteDestructionPage = () => {
    return (
        <AppLayout>
            <div>
                {/* --- Enhanced Header --- */}
                <div className="relative bg-white/70 backdrop-blur-lg border border-emerald-300/30 rounded-lg p-8 mb-10 overflow-hidden">
                     <div className="absolute top-0 right-0 -mt-20 -mr-20 text-emerald-500/5">
                        <HardDrive className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold text-gray-800">Secure E-Waste Destruction</h2>
                        <p className="text-slate-500 mt-2 max-w-2xl">
                           Permanently erase your digital footprint from old hard drives, phones, and electronic media with our certified and environmentally responsible destruction services.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Main Content Section --- */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-white/80 backdrop-blur-sm border-emerald-300/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl"><ShieldCheck className="text-emerald-500 h-7 w-7"/>The Hidden Digital Risk</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                                <p>Discarded hard drives, old company phones, and USB sticks can be a goldmine for data thieves. Simply deleting files or formatting a drive is not enough to permanently erase the data, leaving you vulnerable to breaches.</p>
                                <p>We use certified, multi-pass data destruction methods to ensure that all information on your old electronic devices is completely and permanently unrecoverable, protecting your privacy and security.</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-white/80 backdrop-blur-sm border-emerald-300/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl"><Recycle className="text-emerald-500 h-7 w-7"/>Our Certified Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProcessStep
                                    icon={DatabaseZap}
                                    title="1. Certified Data Wiping"
                                    description="Our software overwrites your data multiple times with random patterns, meeting DoD 5220.22-M and NIST 800-88 standards for complete data erasure."
                                />
                                <ProcessStep
                                    icon={ShieldCheck}
                                    title="2. Physical Destruction"
                                    description="For ultimate security, we physically shred the devices—hard drives, SSDs, phones—into tiny fragments, rendering them completely inoperable and the data unrecoverable."
                                />
                                <ProcessStep
                                    icon={Recycle}
                                    title="3. Responsible E-Recycling"
                                    description="After destruction, all residual materials are responsibly recycled in compliance with environmental regulations, preventing hazardous materials from entering landfills."
                                    isLast
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Sidebar / Call to Action --- */}
                    <div className="lg:col-span-1">
                         <Card className="bg-white/80 backdrop-blur-sm border-emerald-300/30 sticky top-24">
                            <CardHeader>
                                <CardTitle>Ready to Erase Your Data?</CardTitle>
                                <CardDescription>
                                    Find a certified vendor near you to schedule a secure e-waste pickup.
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

export default EWasteDestructionPage;

