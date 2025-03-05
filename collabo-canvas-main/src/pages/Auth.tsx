
import React from "react";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Auth = () => {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const isSignUp = location.pathname === "/sign-up";

  // If already signed in, redirect to homepage
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
        }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-3 h-3 rounded-full bg-primary animate-pulse inline-block mr-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
          <h1 className="text-2xl font-medium inline-block">Collabo Canvas</h1>
          <p className="text-gray-500 mt-2">
            {isSignUp ? "Create an account to get started" : "Sign in to continue to the canvas"}
          </p>
        </div>

        {isSignUp ? (
          <SignUp
            routing="path"
            path="/sign-up"
            redirectUrl="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-lg rounded-lg border border-gray-200",
                formButtonPrimary: "bg-primary hover:bg-primary/90",
              },
            }}
          />
        ) : (
          <SignIn
            routing="path"
            path="/sign-in"
            redirectUrl="/"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-lg rounded-lg border border-gray-200",
                formButtonPrimary: "bg-primary hover:bg-primary/90",
              },
            }}
          />
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <a
              href={isSignUp ? "/sign-in" : "/sign-up"}
              className="text-primary hover:underline font-medium"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
