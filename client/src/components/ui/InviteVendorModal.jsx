import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Loader2, Send } from 'lucide-react';
import api from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export const InviteVendorModal = ({ isOpen, onClose }) => {
    const form = useForm({
        resolver: zodResolver(inviteSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data) => {
        try {
            const response = await api.post('/invitations', data);
            toast.success(response.data.message);
            // Reset the form and close the modal on success
            form.reset();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send invitation.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-xl border-emerald-300/30">
                <DialogHeader>
                    <DialogTitle>Invite a New Vendor</DialogTitle>
                    <DialogDescription>
                        Enter the vendor's email address to send them a registration link.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vendor's Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="vendor@example.com" {...field} className="bg-white/70"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Invitation
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

