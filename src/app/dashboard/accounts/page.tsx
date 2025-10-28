"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import {
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Plus,
  Unlink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { SocialAccount } from "@/types/database";

const platformConfig = {
  x: {
    name: "X (Twitter)",
    icon: Twitter,
    color: "bg-black text-white",
    description: "Connect your X account to post tweets and threads",
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    description: "Share photos and stories on Instagram",
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-600 text-white",
    description: "Post professional content on LinkedIn",
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-500 text-white",
    description: "Share posts and updates on Facebook",
  },
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchAccounts();

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");

    if (success === "connected") {
      setMessage({ type: "success", text: "Account connected successfully!" });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        connection_failed: "Failed to connect account. Please try again.",
        oauth_error: "Authorization was denied or failed.",
        invalid_state: "Security validation failed. Please try again.",
        missing_parameters: "Missing required parameters. Please try again.",
      };
      setMessage({
        type: "error",
        text:
          errorMessages[error] ||
          "An error occurred while connecting your account.",
      });
    }

    // Clear URL parameters
    if (success || error) {
      window.history.replaceState({}, "", "/dashboard/accounts");
    }
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/social-accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    setConnectingPlatform(platform);
    try {
      // Redirect to OAuth flow
      window.location.href = `/api/auth/connect/${platform}`;
    } catch (error) {
      console.error("Failed to connect account:", error);
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) {
      return;
    }

    try {
      const response = await fetch(`/api/social-accounts/${accountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAccounts(accounts.filter((account) => account.id !== accountId));
      }
    } catch (error) {
      console.error("Failed to disconnect account:", error);
    }
  };

  const getConnectedAccount = (platform: string) => {
    return accounts.find(
      (account) => account.platform === platform && account.is_active
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Social Media Accounts
        </h1>
        <p className="text-xl font-medium text-gray-600">
          Connect your social media accounts to start automating your posts
        </p>
      </div>

      {message && (
        <div
          className={`mb-8 p-6 rounded-2xl border-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <svg
                className="w-6 h-6 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="text-lg font-semibold">{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid gap-8">
        {Object.entries(platformConfig).map(([platform, config]) => {
          const Icon = config.icon;
          const connectedAccount = getConnectedAccount(platform);
          const isConnecting = connectingPlatform === platform;

          return (
            <div
              key={platform}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className={`p-4 rounded-2xl ${config.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {config.name}
                      </h3>
                      {connectedAccount && (
                        <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </div>
                      )}
                    </div>
                    <p className="text-lg font-medium text-gray-600">
                      {config.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {connectedAccount ? (
                    <>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          @{connectedAccount.username}
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                          Connected{" "}
                          {new Date(
                            connectedAccount.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleDisconnect(connectedAccount.id)}
                        className="text-red-600 hover:text-red-700 border-2 border-red-200 hover:bg-red-50 rounded-2xl px-6 py-3 font-bold"
                      >
                        <Unlink className="h-5 w-5 mr-2" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(platform)}
                      disabled={isConnecting}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 py-3 font-bold text-lg"
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-3" />
                          <span>Connect</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-16 text-center mt-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            No accounts connected
          </h3>
          <p className="text-xl font-medium text-gray-600 mb-10 max-w-lg mx-auto">
            Connect your first social media account to start automating your
            posts and growing your audience
          </p>
          <Button
            onClick={() => handleConnect("x")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl text-lg font-bold"
          >
            <Plus className="h-6 w-6 mr-3" />
            Connect Your First Account
          </Button>
        </div>
      )}
    </div>
  );
}
