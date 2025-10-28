"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    age: z.string().optional(),
    occupation: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          age: data.age && data.age !== "" ? parseInt(data.age) : undefined,
          occupation:
            data.occupation && data.occupation !== ""
              ? data.occupation
              : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create account");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Account Created!
          </h3>
          <p className="text-lg text-gray-600">
            Redirecting to sign in page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Create Account
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of creators automating their social media
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="firstName"
                className="text-lg font-bold text-gray-700"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                className="h-16 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="lastName"
                className="text-lg font-bold text-gray-700"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                className="h-16 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-lg font-bold text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="h-16 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="age" className="text-lg font-bold text-gray-700">
                Age (Optional)
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                min="13"
                max="120"
                className="h-16 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4"
                {...register("age")}
              />
              {errors.age && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.age.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="occupation"
                className="text-lg font-bold text-gray-700"
              >
                Occupation (Optional)
              </Label>
              <Input
                id="occupation"
                type="text"
                placeholder="Content Creator"
                className="h-16 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4"
                {...register("occupation")}
              />
              {errors.occupation && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.occupation.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="password"
              className="text-lg font-bold text-gray-700"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-16 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 pr-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-6 w-6" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="confirmPassword"
              className="text-lg font-bold text-gray-700"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-16 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 pr-12"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-6 w-6" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-base text-red-600 font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-16 text-xl bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
