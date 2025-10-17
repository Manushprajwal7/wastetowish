"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalRequests: 0,
    completedRequests: 0,
    availableItems: 0,
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin (in a real app, this would be verified on the backend)
    if (user?.email?.includes("admin")) {
      setIsAdmin(true);
    }
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchAdminStats = async () => {
      try {
        // Get total users
        const usersSnapshot = await getCountFromServer(collection(db, "users"));
        const totalUsers = usersSnapshot.data().count;

        // Get total items
        const itemsSnapshot = await getCountFromServer(collection(db, "items"));
        const totalItems = itemsSnapshot.data().count;

        // Get available items
        const availableQuery = query(
          collection(db, "items"),
          where("status", "==", "available")
        );
        const availableSnapshot = await getCountFromServer(availableQuery);
        const availableItems = availableSnapshot.data().count;

        // Get total requests
        const requestsSnapshot = await getCountFromServer(
          collection(db, "requests")
        );
        const totalRequests = requestsSnapshot.data().count;

        // Get completed requests
        const completedQuery = query(
          collection(db, "requests"),
          where("status", "==", "completed")
        );
        const completedSnapshot = await getCountFromServer(completedQuery);
        const completedRequests = completedSnapshot.data().count;

        setStats({
          totalUsers,
          totalItems,
          totalRequests,
          completedRequests,
          availableItems,
        });

        // Get category distribution
        const itemsData = await getDocs(collection(db, "items"));
        const categoryCount: Record<string, number> = {};
        itemsData.docs.forEach((doc) => {
          const category = doc.data().category;
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const categoryChartData = Object.entries(categoryCount).map(
          ([name, value]) => ({
            name,
            value,
          })
        );
        setCategoryData(categoryChartData);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Access Denied</p>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin dashboard
          </p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform analytics and moderation tools
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground text-sm">
                Total Users
              </h3>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground text-sm">
                Total Items
              </h3>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalItems}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground text-sm">
                Available Items
              </h3>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.availableItems}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground text-sm">
                Total Requests
              </h3>
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalRequests}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground text-sm">
                Completed
              </h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{stats.completedRequests}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Category Distribution */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Items by Category</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No data available
              </p>
            )}
          </div>

          {/* Request Status Overview */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Request Completion Rate</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm font-bold">
                    {stats.totalRequests > 0
                      ? Math.round(
                          (stats.completedRequests / stats.totalRequests) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        stats.totalRequests > 0
                          ? (stats.completedRequests / stats.totalRequests) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Completed
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.completedRequests}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Pending</p>
                  <p className="text-2xl font-bold">
                    {stats.totalRequests - stats.completedRequests}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Links */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Management Tools</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
              >
                <Users className="w-4 h-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/items">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
              >
                <Package className="w-4 h-4" />
                Manage Items
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
              >
                <AlertCircle className="w-4 h-4" />
                View Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
