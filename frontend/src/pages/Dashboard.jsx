import { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Library, 
  Users, 
  TrendingUp, 
  Clock, 
  Star,
  ArrowRight,
  BookMarked,
  Settings,
  Award,
  BarChart3
} from "lucide-react";

export default function Dashboard() {
  const { role, firstName } = useAuth();

  const quickActions = [
    {
      title: "Browse Books",
      description: "Explore our vast collection of books",
      icon: BookOpen,
      link: "/books",
      color: "from-blue-500 to-cyan-500",
      show: true
    },
    {
      title: "My Borrowed Books",
      description: "View your currently borrowed items",
      icon: BookMarked,
      link: "/my-borrows",
      color: "from-purple-500 to-pink-500",
      show: role === "USER"
    },
    {
      title: "Manage Books",
      description: "Add, edit, or remove books from library",
      icon: Library,
      link: "/manage-books",
      color: "from-emerald-500 to-teal-500",
      show: role === "ADMIN" || role === "LIBRARIAN"
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      link: "/users",
      color: "from-orange-500 to-red-500",
      show: role === "ADMIN"
    },
    {
      title: "Analytics",
      description: "View library statistics and reports",
      icon: BarChart3,
      link: "/analytics",
      color: "from-indigo-500 to-purple-500",
      show: role === "ADMIN" || role === "LIBRARIAN"
    }
  ].filter(action => action.show);

  const stats = [
    {
      label: "Books Available",
      value: "2,847",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
      show: true
    },
    {
      label: "Active Readers",
      value: "486",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      show: role === "ADMIN" || role === "LIBRARIAN"
    },
    {
      label: "Books Borrowed",
      value: role === "USER" ? "12" : "1,234",
      icon: TrendingUp,
      color: "bg-emerald-100 text-emerald-600",
      show: true
    },
    {
      label: "Reading Streak",
      value: "7 days",
      icon: Award,
      color: "bg-orange-100 text-orange-600",
      show: role === "USER"
    }
  ].filter(stat => stat.show);

  const recentActivity = [
    { book: "The Great Gatsby", action: "Borrowed", time: "2 hours ago" },
    { book: "1984", action: "Returned", time: "1 day ago" },
    { book: "To Kill a Mockingbird", action: "Reserved", time: "3 days ago" }
  ];

  const getRoleBadgeColor = (userRole) => {
    switch(userRole) {
      case "ADMIN": return "bg-red-100 text-red-700 border-red-200";
      case "LIBRARIAN": return "bg-purple-100 text-purple-700 border-purple-200";
      case "USER": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {firstName || "User"}! 👋
              </h1>
              <p className="text-white/90 text-lg">
                Ready to continue your reading journey?
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full border-2 ${getRoleBadgeColor(role)} bg-white font-semibold text-sm`}>
              {role || "GUEST"}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 transform"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group relative overflow-hidden rounded-xl p-6 border-2 border-gray-200 hover:border-transparent transition-all hover:shadow-lg"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2 text-lg">{action.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                      <div className="flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
                        <span>Get started</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-indigo-600" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{activity.book}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                to="/activity" 
                className="mt-6 block text-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              >
                View all activity →
              </Link>
            </div>

            {/* Quick Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Quick Settings
              </h2>
              <div className="space-y-3">
                <Link 
                  to="/settings" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Account Settings</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link 
                  to="/preferences" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Reading Preferences</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}