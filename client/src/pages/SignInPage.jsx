import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import { signinSchema } from "@/schemas/authSchemas";
import useAuth from "@/hooks/use-auth";
import api from "@/lib/axios";

import Template from "@/components/auth/Template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      const { token } = response.data;

      localStorage.setItem('authToken', token);
      await login(); 
      
      toast.success("Login successful! Redirecting...");
      navigate('/dashboard');

    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      console.error("Login error:", error);
      toast.error(errorMessage);
    }
  };

  return (
    <Template title="Welcome Back!">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600">Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="name@example.com" 
                    {...field} 
                    // Glassmorphism style for input
                    className="bg-white/50 backdrop-blur-sm border border-emerald-300/30 shadow-sm focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      {...field} 
                      // Glassmorphism style for input
                      className="bg-white/50 backdrop-blur-sm border border-emerald-300/30 shadow-sm focus:border-primary"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <div className="text-right">
                    <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                        Forgot Password?
                    </Link>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            // Glassmorphism style for button
            className="w-full font-bold bg-gradient-to-r from-emerald-500/80 to-teal-600/80 backdrop-blur-lg text-white border border-emerald-500/50 hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </Template>
  );
};

export default SignInPage;

