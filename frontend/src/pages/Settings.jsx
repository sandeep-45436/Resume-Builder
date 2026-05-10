import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api, { formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "sonner";
import { User, Lock, AlertTriangle } from "lucide-react";

export default function Settings() {
    const { user, refresh, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-stone-50" data-testid="settings-page">
            <Toaster richColors />
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-12 pb-20">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-2">Account</div>
                <h1 className="font-display text-4xl tracking-tighter font-bold mb-10">Settings</h1>

                <ProfileCard user={user} onSaved={refresh} />
                <ChangePasswordCard />
                <DangerZone onDeleted={async () => { await logout(); navigate("/", { replace: true }); }} />
            </div>
            <Footer />
        </div>
    );
}

function ProfileCard({ user, onSaved }) {
    const [name, setName] = useState(user?.name || "");
    const [saving, setSaving] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put("/auth/profile", { name });
            await onSaved();
            toast.success("Profile updated");
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Update failed");
        } finally {
            setSaving(false);
        }
    };
    return (
        <section className="bg-white border border-stone-200 p-6 mb-6" data-testid="profile-card">
            <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-[#002FA7]" />
                <h2 className="font-display text-xl font-semibold tracking-tight">Profile</h2>
            </div>
            <form onSubmit={submit}>
                <label className="block text-xs font-mono uppercase tracking-[0.2em] text-stone-600">Email</label>
                <input
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-stone-100 border border-stone-200 px-3 py-2 mt-1 text-sm text-stone-600"
                />
                <label className="block text-xs font-mono uppercase tracking-[0.2em] text-stone-600 mt-4">Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                    data-testid="settings-name-input"
                />
                <button type="submit" disabled={saving} className="mt-5 bg-[#002FA7] text-white px-5 py-2 text-sm font-medium hover:bg-[#00227a] disabled:opacity-60" data-testid="settings-save-profile">
                    {saving ? "Saving…" : "Save changes"}
                </button>
            </form>
        </section>
    );
}

function ChangePasswordCard() {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [saving, setSaving] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        if (next !== confirm) return toast.error("New passwords don't match");
        setSaving(true);
        try {
            await api.post("/auth/change-password", { current_password: current, new_password: next });
            setCurrent(""); setNext(""); setConfirm("");
            toast.success("Password updated");
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Update failed");
        } finally {
            setSaving(false);
        }
    };
    return (
        <section className="bg-white border border-stone-200 p-6 mb-6" data-testid="password-card">
            <div className="flex items-center gap-2 mb-4">
                <Lock size={16} className="text-[#002FA7]" />
                <h2 className="font-display text-xl font-semibold tracking-tight">Change password</h2>
            </div>
            <form onSubmit={submit} className="grid md:grid-cols-3 gap-3">
                <Input label="Current" value={current} onChange={setCurrent} testId="settings-current-password" />
                <Input label="New" value={next} onChange={setNext} testId="settings-new-password" />
                <Input label="Confirm" value={confirm} onChange={setConfirm} testId="settings-confirm-password" />
                <div className="md:col-span-3">
                    <button type="submit" disabled={saving || !current || !next} className="bg-[#002FA7] text-white px-5 py-2 text-sm font-medium hover:bg-[#00227a] disabled:opacity-60" data-testid="settings-change-password-submit">
                        {saving ? "Updating…" : "Update password"}
                    </button>
                </div>
            </form>
        </section>
    );
}

function Input({ label, value, onChange, testId }) {
    return (
        <label className="block">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-stone-600">{label}</span>
            <input
                type="password"
                required
                minLength={6}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                data-testid={testId}
            />
        </label>
    );
}

function DangerZone({ onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const handleDelete = async () => {
        if (!window.confirm("This permanently deletes your account, resumes, and cover letters. Continue?")) return;
        setDeleting(true);
        try {
            await api.delete("/auth/account");
            toast.success("Account deleted");
            await onDeleted();
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Delete failed");
            setDeleting(false);
        }
    };
    return (
        <section className="bg-white border border-red-200 p-6" data-testid="danger-card">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-600" />
                <h2 className="font-display text-xl font-semibold tracking-tight text-red-700">Danger zone</h2>
            </div>
            <p className="text-sm text-stone-600 mb-4">Deleting your account will remove all your resumes, cover letters, and personal data. This cannot be undone.</p>
            <button onClick={handleDelete} disabled={deleting} className="bg-red-600 text-white px-5 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-60" data-testid="settings-delete-account">
                {deleting ? "Deleting…" : "Delete my account"}
            </button>
        </section>
    );
}
