"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import {
  BarChart3,
  Users,
  Eye,
  Globe,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  TrendingUp,
} from "lucide-react";

type TimeRange = "today" | "7d" | "30d" | "all";

interface PageStat {
  path: string;
  title: string;
  views: number;
}

interface VisitorPage {
  page_path: string;
  page_title: string;
  created_at: string;
}

interface Visitor {
  id: string;
  visitor_hash: string;
  device: string;
  browser: string;
  country: string;
  first_seen: string;
  last_seen: string;
  pages: VisitorPage[];
}

interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  todayVisitors: number;
  todayPageViews: number;
  topPages: PageStat[];
  recentVisitors: Visitor[];
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="w-4 h-4" />;
  if (device === "Tablet") return <Tablet className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>("7d");
  const [expandedVisitor, setExpandedVisitor] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Không có phiên đăng nhập");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/analytics?range=${range}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const ranges: { key: TimeRange; label: string }[] = [
    { key: "today", label: "Hôm nay" },
    { key: "7d", label: "7 ngày" },
    { key: "30d", label: "30 ngày" },
    { key: "all", label: "Tất cả" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 border border-dashed border-red-800 rounded-2xl bg-red-950/20">
        <BarChart3 className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
        <p className="text-red-400 text-lg font-medium">Lỗi tải dữ liệu Analytics</p>
        <p className="text-zinc-500 text-sm mt-1">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Time Range Filter */}
      <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg w-fit border border-zinc-800">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              range === r.key
                ? "bg-emerald-600 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-zinc-500">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Visitors</span>
          </div>
          <p className="text-3xl font-bold text-zinc-50">{data.totalVisitors.toLocaleString()}</p>
          <p className="text-xs text-zinc-600">Người truy cập duy nhất</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-zinc-500">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Pageviews</span>
          </div>
          <p className="text-3xl font-bold text-zinc-50">{data.totalPageViews.toLocaleString()}</p>
          <p className="text-xs text-zinc-600">Tổng lượt xem trang</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Hôm nay</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{data.todayVisitors.toLocaleString()}</p>
          <p className="text-xs text-zinc-600">{data.todayPageViews} lượt xem</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-zinc-500">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Trang phổ biến</span>
          </div>
          <p className="text-lg font-bold text-zinc-50 truncate">
            {data.topPages[0]?.path || "—"}
          </p>
          <p className="text-xs text-zinc-600">{data.topPages[0]?.views || 0} lượt xem</p>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Trang phổ biến nhất
          </h3>
        </div>
        {data.topPages.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-600 text-sm">
            Chưa có dữ liệu pageview
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50">
                <th className="text-left px-6 py-3 font-medium">Trang</th>
                <th className="text-right px-6 py-3 font-medium">Lượt xem</th>
              </tr>
            </thead>
            <tbody>
              {data.topPages.map((page, i) => (
                <tr
                  key={page.path}
                  className="border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div>
                      <span className="text-sm text-zinc-300 font-medium">{page.path}</span>
                      {page.title && page.title !== page.path && (
                        <p className="text-xs text-zinc-600 mt-0.5 truncate max-w-md">{page.title}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-sm font-semibold text-zinc-200">{page.views.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Visitors Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Visitors gần đây
          </h3>
          <p className="text-xs text-zinc-600 mt-1">Click vào visitor để xem chi tiết các trang đã xem</p>
        </div>
        {data.recentVisitors.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-600 text-sm">
            Chưa có visitor nào
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/30">
            {data.recentVisitors.map((visitor) => (
              <div key={visitor.id}>
                {/* Visitor Row */}
                <button
                  onClick={() => setExpandedVisitor(expandedVisitor === visitor.id ? null : visitor.id)}
                  className="w-full px-6 py-3.5 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors text-left"
                >
                  {/* Device Icon */}
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    <DeviceIcon device={visitor.device} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-zinc-300">
                        #{visitor.visitor_hash.substring(0, 8)}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded font-medium">
                        {visitor.browser}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded font-medium">
                        {visitor.device}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      <span className="text-xs text-zinc-600">{formatTime(visitor.last_seen)}</span>
                    </div>
                  </div>

                  {/* Pages Count */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-500">{visitor.pages.length} trang</span>
                    {expandedVisitor === visitor.id ? (
                      <ChevronUp className="w-4 h-4 text-zinc-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-600" />
                    )}
                  </div>
                </button>

                {/* Expanded: Page Views */}
                {expandedVisitor === visitor.id && visitor.pages.length > 0 && (
                  <div className="bg-zinc-950/50 border-t border-zinc-800/50 px-6 py-3">
                    <div className="ml-12 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium mb-2">
                        Các trang đã xem
                      </p>
                      {visitor.pages.map((page, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 py-1.5 text-sm"
                        >
                          <span className="text-zinc-600 text-xs font-mono w-28 shrink-0">
                            {formatDateTime(page.created_at)}
                          </span>
                          <span className="text-emerald-400/80">→</span>
                          <span className="text-zinc-400 truncate">{page.page_path}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-zinc-700">
        Dữ liệu được thu thập ẩn danh • Hash visitor xoay vòng hàng ngày • Không sử dụng cookie
      </p>
    </div>
  );
}
