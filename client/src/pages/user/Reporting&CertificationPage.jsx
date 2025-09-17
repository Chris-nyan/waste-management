import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, ShieldCheck, FileCheck2 } from 'lucide-react';

const ReportingPage = () => {
    return (
        <AppLayout>
             <div>
                <div className="flex items-center gap-4 mb-6">
                    <Award className="h-10 w-10 text-primary" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Reporting & Certification</h2>
                        <p className="text-slate-500 mt-1">Proof of Compliance and Peace of Mind.</p>
                    </div>
                </div>

                <Card className="bg-white/80 backdrop-blur-sm border-emerald-300/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileCheck2 className="text-emerald-500"/>Your Certificate of Destruction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-600">
                        <p>After every secure destruction service, we provide you with a formal Certificate of Destruction. This legal document serves as your official record and proof that your sensitive materials were handled and destroyed in compliance with all privacy laws and regulations.</p>
                        <div className="border-l-4 border-emerald-500 pl-4">
                            <h4 className="font-semibold">Your Certificate Includes:</h4>
                            <ul className="list-disc list-inside mt-2 text-sm">
                                <li>A unique serial number for auditing.</li>
                                <li>The date and location of destruction.</li>
                                <li>A description of the materials destroyed.</li>
                                <li>A formal statement of destruction.</li>
                            </ul>
                        </div>
                        <p>This documentation is crucial for legal audits, corporate compliance, and giving you complete peace of mind.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ReportingPage;
