'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Package,
  ClipboardList,
  CreditCard,
  Users,
  MessageSquareHeart,
  Palette,
  UserCheck,
  FileText,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Eye,
  Upload,
  Save,
  KeyRound,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useStore } from '@/components/ThemeContextProvider';

export default function AdminPage() {
  const router = useRouter();
  const { refreshSettings } = useStore();

  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | 'orders'
    | 'products'
    | 'payments'
    | 'customers'
    | 'reviews'
    | 'channels'
    | 'theme'
    | 'profile'
    | 'security'
    | 'logs'
  >('orders');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Customers State
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [pointAdjustModal, setPointAdjustModal] = useState<{
    customer: any;
    amount: number;
    reason: string;
  } | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Security / Password change
  const [newAdminCode, setNewAdminCode] = useState('');
  const [changeCodeMsg, setChangeCodeMsg] = useState('');

  // Logs State
  const [logs, setLogs] = useState<any[]>([]);

  // Global Notification
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  // 1. Check Auth
  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setAuthChecked(true);
          loadAllData();
        }
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const loadAllData = () => {
    loadOrders();
    loadProducts();
    loadCustomers();
    loadReviews();
    loadSettings();
    loadLogs();
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(orderSearch)}&status=${encodeURIComponent(orderFilterStatus)}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch {}
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products?all=true');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {}
  };

  const loadCustomers = async () => {
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`);
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch {}
  };

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      if (Array.isArray(data)) setReviews(data);
    } catch {}
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettingsForm(data);
    } catch {}
  };

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch {}
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Order actions
  const handleUpdateOrderStatus = async (queueNumber: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(queueNumber)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showNotice(`อัปเดตสถานะคิว ${queueNumber} เป็น "${status}" เรียบร้อย`);
        loadOrders();
        if (selectedOrder?.queueNumber === queueNumber) {
          setSelectedOrder((prev: any) => ({ ...prev, status }));
        }
      }
    } catch {
      showNotice('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
    }
  };

  // Payment slip actions
  const handleApproveSlip = async (queueNumber: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(queueNumber)}/approve-slip`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotice(
          approved
            ? `อนุมัติสลิปคิว ${queueNumber} เรียบร้อย! ${data.pointResult?.message || ''}`
            : `ปฏิเสธสลิปคิว ${queueNumber} เรียบร้อย`
        );
        loadOrders();
        loadCustomers();
      } else {
        showNotice(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch {
      showNotice('เกิดข้อผิดพลาดในการตรวจสอบสลิป', 'error');
    }
  };

  // Review status
  const handleUpdateReviewStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showNotice(status === 'APPROVED' ? 'อนุมัติรีวิวสำเร็จ (มอบแต้มสะสมให้อัตโนมัติ)' : 'ปฏิเสธรีวิวสำเร็จ');
        loadReviews();
        loadCustomers();
      }
    } catch {
      showNotice('เกิดข้อผิดพลาดในการอัปเดตรีวิว', 'error');
    }
  };

  // Product actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isNew = !editingProduct.id;
      const url = isNew ? '/api/products' : `/api/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        showNotice(`บันทึกสินค้า "${editingProduct.name}" เรียบร้อย`);
        setEditingProduct(null);
        loadProducts();
      } else {
        const err = await res.json();
        showNotice(err.error || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
      }
    } catch {
      showNotice('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`ต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotice(`ลบสินค้า "${name}" เรียบร้อย`);
        loadProducts();
      }
    } catch {
      showNotice('เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  // Adjust Points
  const handleAdjustPoints = async () => {
    if (!pointAdjustModal) return;
    try {
      const res = await fetch('/api/admin/points/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: pointAdjustModal.customer.id,
          amount: pointAdjustModal.amount,
          reason: pointAdjustModal.reason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotice(`ปรับแต้มให้คุณ ${pointAdjustModal.customer.name} เรียบร้อยแล้ว`);
        setPointAdjustModal(null);
        loadCustomers();
      } else {
        showNotice(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch {
      showNotice('เกิดข้อผิดพลาดในการปรับแต้ม', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        showNotice('บันทึกการตั้งค่าเรียบร้อยแล้ว');
        await refreshSettings();
      } else {
        showNotice('ไม่สามารถบันทึกการตั้งค่าได้', 'error');
      }
    } catch {
      showNotice('เกิดข้อผิดพลาด', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Change Admin Access Code
  const handleChangeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminCode.trim()) return;
    try {
      const res = await fetch('/api/admin/change-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newCode: newAdminCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setChangeCodeMsg('เปลี่ยนรหัสผ่านสำเร็จ!');
        setNewAdminCode('');
        showNotice('เปลี่ยนรหัสผ่านเข้าหลังบ้านเรียบร้อย');
      } else {
        setChangeCodeMsg(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      setChangeCodeMsg('เกิดข้อผิดพลาด');
    }
  };

  // Generic File Upload for Admin (Profile GIF, Cover GIF, QRs, etc.)
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'admin');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsForm((prev: any) => ({ ...prev, [fieldName]: data.url }));
        showNotice(`อัปโหลดไฟล์สำเร็จ: ${data.fileName}`);
      } else {
        showNotice(data.error || 'เกิดข้อผิดพลาดในการอัปโหลด', 'error');
      }
    } catch {
      showNotice('ไม่สามารถอัปโหลดไฟล์ได้', 'error');
    }
  };

  if (!authChecked) {
    return <div className="p-10 text-center font-thai text-rose-500">กำลังตรวจสอบสิทธิ์...</div>;
  }

  const navTabs = [
    { id: 'orders', label: 'คิว & บรีฟงาน', icon: ClipboardList, count: orders.length },
    { id: 'payments', label: 'สลิปชำระเงิน', icon: CreditCard, count: orders.filter((o) => o.slipUrl && !o.slipApproved).length },
    { id: 'products', label: 'จัดการสินค้า', icon: Package, count: products.length },
    { id: 'customers', label: 'ลูกค้า & แต้ม', icon: Users, count: customers.length },
    { id: 'reviews', label: 'อนุมัติรีวิว', icon: MessageSquareHeart, count: reviews.filter((r) => r.status === 'PENDING').length },
    { id: 'channels', label: 'ช่องทางชำระ', icon: CreditCard },
    { id: 'theme', label: 'ธีม & สไตล์', icon: Palette },
    { id: 'profile', label: 'โปรไฟล์ร้าน', icon: UserCheck },
    { id: 'security', label: 'ความปลอดภัย', icon: KeyRound },
    { id: 'logs', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 pb-28 pt-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white rounded-3xl p-5 shadow-sm border border-rose-100 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 font-thai flex items-center gap-1.5">
              <span>ระบบหลังบ้าน Shernice</span>
              <Sparkles className="w-4 h-4 text-rose-500 fill-rose-300" />
            </h1>
            <p className="text-xs text-gray-400 font-thai">
              จัดการสินค้า คิวงาน สลิปโอนเงิน แต้มสะสม และรีวิว
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAllData}
            title="รีเฟรชข้อมูล"
            className="p-2.5 rounded-2xl border border-rose-100 hover:bg-rose-50 text-rose-600 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 font-bold text-xs sm:text-sm font-thai transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Floating Notice Alert */}
      {notice && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-thai shadow-md animate-fade-in flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-xs font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:p-3.5 shadow-sm border border-rose-100 mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-thai transition-all active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-md shadow-rose-200'
                    : 'bg-rose-50/40 hover:bg-rose-100/70 text-gray-700 border border-rose-100 hover:border-rose-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                      isActive ? 'bg-white text-rose-600' : 'bg-rose-200 text-rose-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ORDERS & BRIEFS & QUEUE */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                placeholder="ค้นหาเลขคิว, ชื่อลูกค้า, ID..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-rose-100 bg-rose-50/20 text-xs sm:text-sm font-thai focus:outline-none focus:border-rose-400"
              />
              <Search className="w-4 h-4 text-rose-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={orderFilterStatus}
                onChange={(e) => {
                  setOrderFilterStatus(e.target.value);
                  setTimeout(loadOrders, 50);
                }}
                className="px-3 py-2 rounded-2xl border border-rose-100 bg-rose-50/20 text-xs sm:text-sm font-thai"
              >
                <option value="">ทุกสถานะ</option>
                <option value="รอชำระเงิน">รอชำระเงิน</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="เสร็จแล้ว">เสร็จแล้ว</option>
                <option value="ยกเลิก">ยกเลิก</option>
              </select>

              <button
                onClick={loadOrders}
                className="px-4 py-2 rounded-2xl bg-rose-500 text-white font-bold text-xs sm:text-sm font-thai"
              >
                ค้นหา
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm font-thai">
                <thead className="bg-rose-50/60 text-gray-700 font-bold border-b border-rose-100">
                  <tr>
                    <th className="py-3 px-4">เลขคิว</th>
                    <th className="py-3 px-4">ลูกค้า</th>
                    <th className="py-3 px-4">ฮีโร่ / สกิน</th>
                    <th className="py-3 px-4">ยอดชำระ</th>
                    <th className="py-3 px-4">สลิปโอนเงิน</th>
                    <th className="py-3 px-4">สถานะ</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">
                        {ord.queueNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-800">{ord.customerName}</div>
                        <div className="text-[11px] text-gray-400">
                          {ord.contactPlatform}: {ord.contactId}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{ord.heroName} - {ord.skinName}</div>
                        <div className="text-[11px] text-gray-400">
                          {ord.badgeValue} | สกิน{ord.skinLevel}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-700">
                        {ord.totalPrice} ฿
                      </td>
                      <td className="py-3 px-4">
                        {ord.slipApproved ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> อนุมัติสลิป (+1 แต้ม)
                          </span>
                        ) : ord.slipUrl ? (
                          <button
                            type="button"
                            onClick={() => handleApproveSlip(ord.queueNumber, true)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                            title="คลิกเพื่ออนุมัติสลิปและมอบแต้มสะสม"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>อนุมัติสลิป (+1 แต้ม)</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-thai">
                            ยังไม่แนบสลิป
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.queueNumber, e.target.value)}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold border border-rose-200 bg-white"
                        >
                          <option value="รอชำระเงิน">รอชำระเงิน</option>
                          <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                          <option value="เสร็จแล้ว">เสร็จแล้ว</option>
                          <option value="ยกเลิก">ยกเลิก</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs"
                        >
                          ดูบรีฟ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail Brief Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto border border-rose-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-rose-100">
              <h3 className="font-bold font-thai text-lg text-gray-800">
                รายละเอียดคิว {selectedOrder.queueNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm font-thai">
              <div><span className="text-gray-400">ชื่อลูกค้า:</span> <strong className="text-gray-800">{selectedOrder.customerName}</strong></div>
              <div><span className="text-gray-400">ช่องทาง:</span> <strong>{selectedOrder.contactPlatform} ({selectedOrder.contactId})</strong></div>
              <div><span className="text-gray-400">ชื่อในเกม:</span> <strong>{selectedOrder.inGameName}</strong></div>
              <div><span className="text-gray-400">ฮีโร่ / สกิน:</span> <strong>{selectedOrder.heroName} - {selectedOrder.skinName}</strong></div>
              <div><span className="text-gray-400">ระดับสกิน:</span> <strong>สกิน{selectedOrder.skinLevel}</strong></div>
              <div><span className="text-gray-400">แรงค์:</span> <strong>{selectedOrder.rank}</strong></div>
              <div><span className="text-gray-400">โล่/เม็ด:</span> <strong className="text-rose-600">{selectedOrder.badgeValue}</strong></div>
              {selectedOrder.powerTrait && <div><span className="text-gray-400">พลังแฝง:</span> <strong>{selectedOrder.powerTrait}</strong></div>}
              {selectedOrder.additionalBrief && (
                <div className="p-3 rounded-2xl bg-rose-50 text-gray-700">
                  <span className="text-gray-500 block text-xs">บรีฟเพิ่มเติม:</span>
                  {selectedOrder.additionalBrief}
                </div>
              )}
              {selectedOrder.formBDataJson && (
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-900">
                  <span className="block text-xs font-bold">ข้อมูลบรีฟ Form B:</span>
                  <pre className="text-[11px] whitespace-pre-wrap">{selectedOrder.formBDataJson}</pre>
                </div>
              )}
              <div className="pt-2 border-t border-rose-100">
                <span className="text-gray-400">คำโน้ตสลิป:</span> <strong className="font-mono text-rose-600">{selectedOrder.transferNote}</strong>
              </div>
              {selectedOrder.slipUrl && (
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400 text-xs">สลิปที่แนบมา:</span>
                    {selectedOrder.slipApproved ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                        ✓ สลิปอนุมัติแล้ว (+1 แต้ม)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-bold">
                        รอตรวจสอบสลิป
                      </span>
                    )}
                  </div>
                  <img src={selectedOrder.slipUrl} alt="Slip" className="max-h-56 rounded-xl border object-contain mx-auto mb-2" />
                  {!selectedOrder.slipApproved && (
                    <button
                      type="button"
                      onClick={() => {
                        handleApproveSlip(selectedOrder.queueNumber, true);
                        setSelectedOrder({ ...selectedOrder, slipApproved: true });
                      }}
                      className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs font-thai shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>อนุมัติสลิปโอนเงิน (มอบ 1 แต้มสะสมทันที)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-thai text-xs font-bold"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS & SLIPS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai mb-2">
              ตรวจสอบสลิปโอนเงินที่ลูกค้าแนบมา
            </h2>
            <p className="text-xs text-gray-400 font-thai">
              ระบบตรวจสอบ hash ของสลิปเพื่อป้องกันการใช้ซ้ำ เมื่ออนุมัติ หากลูกค้ามีรีวิวผ่านแล้ว จะได้รับแต้มสะสมทันที
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {orders
              .filter((o) => o.slipUrl)
              .map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-rose-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono font-bold text-rose-600 text-sm">
                        {ord.queueNumber}
                      </span>
                      {ord.slipApproved ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                          ✓ อนุมัติแล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                          รอตรวจสอบ
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-thai text-gray-700 mb-2">
                      คุณ {ord.customerName} ({ord.totalPrice} บาท)
                    </div>

                    <div className="relative h-48 bg-gray-100 rounded-2xl overflow-hidden mb-3 border">
                      <img
                        src={ord.slipUrl}
                        alt="Slip"
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={() => window.open(ord.slipUrl, '_blank')}
                      />
                    </div>

                    <div className="text-[10px] font-mono text-gray-400 truncate mb-3">
                      Hash: {ord.slipHash?.slice(0, 24)}...
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApproveSlip(ord.queueNumber, true)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs font-thai flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>อนุมัติสลิป</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveSlip(ord.queueNumber, false)}
                      className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-600 hover:text-rose-600 font-bold text-xs font-thai"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white rounded-3xl p-5 shadow-sm border border-rose-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai">
                จัดการรายการสินค้า & บริการ
              </h2>
              <p className="text-xs text-gray-400 font-thai">
                แก้ไขชื่อ ราคา คำอธิบาย และรูปภาพตัวอย่าง
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingProduct({
                  code: `${(products.length + 1) / 10}`,
                  name: '',
                  price: 10,
                  description: '',
                  footnote: null,
                  exampleImagesJson: '[]',
                  briefType: 'FORM_A',
                  active: true,
                  displayOrder: products.length + 1,
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm font-thai shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มสินค้าใหม่</span>
            </button>
          </div>

          {/* Product Edit / Create Modal */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-rose-200 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-rose-100">
                  <h3 className="font-bold font-thai text-lg text-gray-800">
                    {editingProduct.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                  </h3>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs sm:text-sm font-thai">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">รหัสสินค้า / ลำดับ (เช่น 1.1)</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.code}
                      onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">ชื่อสินค้า</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">ราคา (THB)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">คำอธิบาย</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">เชิงอรรถ Footnote (ถ้ามี เช่น *1.3...)</label>
                    <input
                      type="text"
                      value={editingProduct.footnote || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, footnote: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">รูปตัวอย่าง (JSON Array ของ URL)</label>
                    <textarea
                      rows={2}
                      value={editingProduct.exampleImagesJson || '[]'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, exampleImagesJson: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-rose-100 font-mono text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
                    >
                      บันทึกสินค้า
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Product Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-rose-500 font-bold">{p.code}</span>
                    <span className="font-mono font-extrabold text-gray-800 text-base">{p.price} ฿</span>
                  </div>
                  <h3 className="font-bold text-base text-gray-800 font-thai mb-1">{p.name}</h3>
                  <p className="text-xs text-gray-500 font-thai line-clamp-2 leading-relaxed mb-2">
                    {p.description}
                  </p>
                  {p.footnote && (
                    <p className="text-[11px] text-rose-500 italic font-thai mb-2">{p.footnote}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-rose-50 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(p)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS & POINTS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 flex justify-between items-center">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai">
                ลูกค้า & บัญชีแต้มสะสม
              </h2>
              <p className="text-xs text-gray-400 font-thai">
                ดูแต้มสะสม ปรับแต้มด้วยตนเอง และตรวจสอบประวัติการได้รับ/แลกแต้ม
              </p>
            </div>
            <div className="w-64">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
                placeholder="ค้นหาชื่อลูกค้า..."
                className="w-full px-3 py-2 rounded-2xl border border-rose-100 bg-rose-50/20 text-xs font-thai focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm font-thai">
                <thead className="bg-rose-50/60 text-gray-700 font-bold border-b border-rose-100">
                  <tr>
                    <th className="py-3 px-4">ชื่อลูกค้า</th>
                    <th className="py-3 px-4">ช่องทางติดต่อ</th>
                    <th className="py-3 px-4">สิทธิ์รีวิว</th>
                    <th className="py-3 px-4">แต้มสะสม</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-rose-50/30">
                      <td className="py-3 px-4 font-bold text-gray-800">{c.name}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {c.contactPlatform}: {c.contactId}
                      </td>
                      <td className="py-3 px-4">
                        {c.hasApprovedReview ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                            ✓ มีสิทธิ์
                          </span>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                            ยังไม่มีรีวิว
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-600 text-base">
                        {c.pointsBalance} แต้ม
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setPointAdjustModal({
                              customer: c,
                              amount: 1,
                              reason: 'แอดมินมอบแต้มพิเศษ',
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs"
                        >
                          ปรับแต้ม
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Adjust Points Modal */}
          {pointAdjustModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-200 shadow-2xl space-y-4">
                <h3 className="font-bold font-thai text-lg text-gray-800">
                  ปรับแต้มให้ {pointAdjustModal.customer.name}
                </h3>
                <div className="space-y-3 text-xs sm:text-sm font-thai">
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">
                      จำนวนแต้มที่จะปรับ (ใส่ค่าบวกเพิ่ม, ค่าลบลด)
                    </label>
                    <input
                      type="number"
                      value={pointAdjustModal.amount}
                      onChange={(e) =>
                        setPointAdjustModal({
                          ...pointAdjustModal,
                          amount: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-rose-100 font-mono text-base font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">เหตุผลในการปรับ</label>
                    <input
                      type="text"
                      value={pointAdjustModal.reason}
                      onChange={(e) =>
                        setPointAdjustModal({
                          ...pointAdjustModal,
                          reason: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-rose-100"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPointAdjustModal(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold font-thai text-xs"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleAdjustPoints}
                    className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold font-thai text-xs shadow-sm"
                  >
                    ยืนยันการปรับแต้ม
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai">
              อนุมัติรีวิวจากลูกค้า (Review Approval)
            </h2>
            <p className="text-xs text-gray-400 font-thai">
              เมื่ออนุมัติรีวิว ลูกค้าจะได้รับสิทธิ์แต้มสะสม และระบบจะมอบแต้มจากสลิปที่รออนุมัติให้โดยอัตโนมัติ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800 font-thai">{rev.customerName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : rev.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  <div className="text-xs text-amber-500 mb-2">
                    {'⭐'.repeat(rev.rating)}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 font-thai bg-rose-50/40 p-3 rounded-2xl mb-3 leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="text-[11px] text-gray-400 font-thai">
                    ติดต่อ: {rev.contactId || '-'} | คิว: {rev.queueNumber || '-'}
                  </div>
                </div>

                <div className="pt-3 border-t border-rose-50 flex gap-2 justify-end">
                  {rev.status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateReviewStatus(rev.id, 'APPROVED')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs font-thai flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>อนุมัติรีวิว</span>
                    </button>
                  )}
                  {rev.status !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateReviewStatus(rev.id, 'REJECTED')}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-600 hover:text-rose-600 font-bold text-xs font-thai"
                    >
                      <span>ปฏิเสธ</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENT CHANNELS */}
      {activeTab === 'channels' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai">
              จัดการช่องทางชำระเงิน (3 ช่องทาง)
            </h2>
            <p className="text-xs text-gray-400 font-thai">
              อัปโหลดภาพ QR พร้อมเพย์ ภาพการ์ดธนาคารกสิกร และหมายเลข TrueMoney
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 1. PromptPay */}
            <div className="p-4 rounded-3xl border border-blue-100 bg-blue-50/30 space-y-3 text-xs font-thai">
              <span className="font-bold text-blue-900 block text-sm">พร้อมเพย์ PromptPay</span>
              <div>
                <label className="block text-gray-600 mb-1">ชื่อบัญชี</label>
                <input
                  type="text"
                  value={settingsForm.promptpayName || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, promptpayName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">ภาพ QR Code</label>
                <img
                  src={settingsForm.promptpayQrUrl || '/images/promptpay-qr.png'}
                  alt="QR"
                  className="h-28 rounded-xl object-contain mx-auto mb-2 border bg-white"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadImage(e, 'promptpayQrUrl')}
                  className="text-[11px]"
                />
              </div>
            </div>

            {/* 2. KBank */}
            <div className="p-4 rounded-3xl border border-emerald-100 bg-emerald-50/30 space-y-3 text-xs font-thai">
              <span className="font-bold text-emerald-900 block text-sm">ธนาคารกสิกรไทย</span>
              <div>
                <label className="block text-gray-600 mb-1">ชื่อบัญชี</label>
                <input
                  type="text"
                  value={settingsForm.kbankName || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, kbankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">ภาพการ์ดบัญชีกสิกร (QR)</label>
                <img
                  src={settingsForm.kbankCardUrl || '/images/kbank-card.png'}
                  alt="KBank"
                  className="h-28 rounded-xl object-contain mx-auto mb-2 border bg-white"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadImage(e, 'kbankCardUrl')}
                  className="text-[11px]"
                />
              </div>
            </div>

            {/* 3. TrueMoney */}
            <div className="p-4 rounded-3xl border border-orange-100 bg-orange-50/30 space-y-3 text-xs font-thai">
              <span className="font-bold text-orange-900 block text-sm">TrueMoney Wallet</span>
              <div>
                <label className="block text-gray-600 mb-1">เบอร์วอเลต</label>
                <input
                  type="text"
                  value={settingsForm.truemoneyNumber || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, truemoneyNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">ชื่อบัญชี</label>
                <input
                  type="text"
                  value={settingsForm.truemoneyName || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, truemoneyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">ค่าธรรมเนียมโอนตรง (บาท)</label>
                <input
                  type="number"
                  value={settingsForm.truemoneyFee || 2}
                  onChange={(e) => setSettingsForm({ ...settingsForm, truemoneyFee: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="w-full py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm font-thai shadow-md shadow-rose-200 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'กำลังบันทึก...' : 'บันทึกช่องทางชำระเงิน'}</span>
          </button>
        </div>
      )}

      {/* TAB 7: THEME & COLORS */}
      {activeTab === 'theme' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai">
              ปรับแต่งธีมและสีสันของร้าน (Theme Colors)
            </h2>
            <p className="text-xs text-gray-400 font-thai">
              เปลี่ยนสีหลัก สีรอง สีพื้นหลัง และสีการ์ด ได้แบบเรียลไทม์
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-thai">
            <div>
              <label className="block text-gray-700 font-bold mb-1">สีหลัก (Primary Color)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.primaryColor || '#fb7185'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border"
                />
                <input
                  type="text"
                  value={settingsForm.primaryColor || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">สีรอง (Secondary Color)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.secondaryColor || '#fda4af'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border"
                />
                <input
                  type="text"
                  value={settingsForm.secondaryColor || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">สีเน้น (Accent Color)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.accentColor || '#c084fc'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border"
                />
                <input
                  type="text"
                  value={settingsForm.accentColor || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">สีพื้นหลัง (Background)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.bgColor || '#fff5f7'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bgColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border"
                />
                <input
                  type="text"
                  value={settingsForm.bgColor || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bgColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">สีการ์ด (Card Color)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settingsForm.cardColor || '#ffffff'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cardColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border"
                />
                <input
                  type="text"
                  value={settingsForm.cardColor || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cardColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="w-full py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm font-thai shadow-md shadow-rose-200 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าธีม'}</span>
          </button>
        </div>
      )}

      {/* TAB 8: PROFILE & MEDIA & MUSIC */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-5 text-xs sm:text-sm font-thai">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai">
              โปรไฟล์ร้าน & ภาพเคลื่อนไหว GIF & เพลงประกอบ
            </h2>
            <p className="text-xs text-gray-400 font-thai">
              รองรับการอัปโหลดไฟล์ GIF ทั้งภาพโปรไฟล์และภาพปก
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">ชื่อร้าน</label>
              <input
                type="text"
                value={settingsForm.shopName || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, shopName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-rose-100"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">คำอธิบาย Bio</label>
              <textarea
                rows={3}
                value={settingsForm.bio || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-rose-100"
              />
            </div>

            {/* Profile Picture GIF upload */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">ภาพโปรไฟล์ (รองรับ GIF)</label>
              <div className="flex items-center gap-3">
                <img
                  src={settingsForm.avatarUrl || '/images/avatar.gif'}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-rose-300"
                />
                <input
                  type="file"
                  accept="image/*,.gif"
                  onChange={(e) => handleUploadImage(e, 'avatarUrl')}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Cover Picture GIF upload */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">ภาพปก Cover (รองรับ GIF)</label>
              <div className="space-y-2">
                <img
                  src={settingsForm.coverUrl || '/images/cover.gif'}
                  alt="Cover"
                  className="w-full h-28 object-cover rounded-2xl border"
                />
                <input
                  type="file"
                  accept="image/*,.gif"
                  onChange={(e) => handleUploadImage(e, 'coverUrl')}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Background Music Config */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
              <span className="font-bold text-rose-700 block text-sm">เพลงประกอบ (Background Music)</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bgMusicEnabled"
                  checked={settingsForm.bgMusicEnabled ?? true}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bgMusicEnabled: e.target.checked })}
                  className="w-4 h-4 accent-rose-500 rounded"
                />
                <label htmlFor="bgMusicEnabled" className="font-semibold text-gray-700 cursor-pointer">
                  เปิดใช้งานระบบเพลงประกอบ
                </label>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">URL ไฟล์เสียง (MP3/OGG)</label>
                <input
                  type="url"
                  value={settingsForm.bgMusicUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bgMusicUrl: e.target.value })}
                  placeholder="https://...mp3"
                  className="w-full px-3 py-2 rounded-xl border border-rose-100 bg-white text-xs font-mono"
                />
              </div>
            </div>

            {/* 4 External links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  ปุ่ม "ตัวอย่างงานเพิ่มเติม" (Google Drive)
                </label>
                <input
                  type="url"
                  value={settingsForm.driveLink || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, driveLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-rose-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  ปุ่ม "ติดต่อทางร้าน" (Line / Social)
                </label>
                <input
                  type="url"
                  value={settingsForm.contactLink || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-rose-100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="w-full py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm font-thai shadow-md shadow-rose-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'กำลังบันทึก...' : 'บันทึกข้อมูลโปรไฟล์ร้าน'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 9: SECURITY (Change Admin Code) */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-5 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai">
              เปลี่ยนรหัสผ่านเข้าหลังบ้าน
            </h2>
            <p className="text-xs text-gray-400 font-thai">
              รหัสเริ่มต้นคือ 2247 (ถูกเข้ารหัสแบบ Bcrypt ไม่ได้เก็บเป็น Plaintext)
            </p>
          </div>

          {changeCodeMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs text-center font-thai">
              {changeCodeMsg}
            </div>
          )}

          <form onSubmit={handleChangeCode} className="space-y-4 font-thai text-xs sm:text-sm">
            <div>
              <label className="block text-gray-700 font-bold mb-1">รหัสผ่านใหม่ (อย่างน้อย 4 หลัก)</label>
              <input
                type="password"
                required
                value={newAdminCode}
                onChange={(e) => setNewAdminCode(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่"
                className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 text-center font-mono text-base tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all active:scale-95"
            >
              บันทึกรหัสผ่านใหม่
            </button>
          </form>
        </div>
      )}

      {/* TAB 10: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai">
            บันทึกประวัติการกระทำของแอดมิน (Admin Audit Logs)
          </h2>

          <div className="divide-y divide-rose-50 text-xs font-thai max-h-[60vh] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex justify-between items-start">
                <div>
                  <span className="font-bold text-gray-800 mr-2">[{log.action}]</span>
                  <span className="text-gray-600">{log.details}</span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono shrink-0 ml-4">
                  {new Date(log.createdAt).toLocaleString('th-TH')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
