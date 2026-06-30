"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Cell, Pie, PieChart } from "recharts";
import { FaBook, FaGithub, FaMoon, FaSun, FaTrash } from "react-icons/fa";

interface Transaksi {
  id: string;
  deskripsi: string;
  jumlah: number;
  tipe: "masuk" | "keluar";
  tanggal: string;
}

interface NewTransactionData {
  deskripsi: string;
  jumlah: number;
  tipe: "masuk" | "keluar";
}

const MAX_VISIBLE_TRANSACTIONS = 50;

const DARK_CHART_COLORS = ["#10b981", "#f43f5e"];
const LIGHT_CHART_COLORS = ["#059669", "#e11d48"];

const rupiahFormatter = new Intl.NumberFormat("id-ID");

const formatRupiah = (value: number) => {
  return rupiahFormatter.format(value);
};

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const safeParseTransactions = (value: string | null): Transaksi[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onResetData: () => void;
}

const Header = memo(function Header({
  isDarkMode,
  onToggleTheme,
  onResetData,
}: HeaderProps) {
  return (
    <header
      className={`flex flex-col md:flex-row md:items-center md:justify-between border-b pb-8 mb-12 ${
        isDarkMode ? "border-zinc-800" : "border-zinc-200"
      }`}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`h-5 w-5 rounded flex items-center justify-center font-bold text-xs ${
              isDarkMode
                ? "bg-zinc-100 text-black"
                : "bg-zinc-900 text-white"
            }`}
          >
            ▲
          </span>

          <h1
            className={`text-xl font-medium tracking-tight ${
              isDarkMode ? "text-white" : "text-zinc-900"
            }`}
          >
            fintrack<span className="text-zinc-500">.inc</span>
          </h1>
        </div>

        <p
          className={`text-sm ${
            isDarkMode ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          Advanced Personal Finance Tracker & Timeline Budgeting Platform.
        </p>
      </div>

      <div className="mt-4 md:mt-0 flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className={`p-2 flex items-center gap-2 rounded-lg border text-xs font-medium transition-all ${
            isDarkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
              : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm"
          }`}
        >
          {isDarkMode ? (
            <>
              <FaSun className="text-amber-400" /> Light Mode
            </>
          ) : (
            <>
              <FaMoon className="text-indigo-500" /> Dark Mode
            </>
          )}
        </button>

        <button
          onClick={onResetData}
          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
            isDarkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 shadow-sm"
          }`}
        >
          Reset All Data
        </button>
      </div>
    </header>
  );
});

interface TransactionFormProps {
  isDarkMode: boolean;
  onAddTransaction: (data: NewTransactionData) => void;
}

const TransactionForm = memo(function TransactionForm({
  isDarkMode,
  onAddTransaction,
}: TransactionFormProps) {
  const [tipeInput, setTipeInput] = useState<"masuk" | "keluar">("masuk");

  const deskripsiRef = useRef<HTMLInputElement>(null);
  const jumlahRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const deskripsi = deskripsiRef.current?.value.trim() ?? "";
    const jumlah = Number(jumlahRef.current?.value);

    if (!deskripsi || !Number.isFinite(jumlah) || jumlah <= 0) {
      return;
    }

    onAddTransaction({
      deskripsi,
      jumlah,
      tipe: tipeInput,
    });

    if (deskripsiRef.current) {
      deskripsiRef.current.value = "";
    }

    if (jumlahRef.current) {
      jumlahRef.current.value = "";
    }
  };

  return (
    <div
      className={`border rounded-xl p-6 transition-all ${
        isDarkMode
          ? "bg-zinc-900/50 border-zinc-800"
          : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      <h2
        className={`text-xs font-bold uppercase tracking-wider mb-6 ${
          isDarkMode ? "text-emerald-400" : "text-emerald-600"
        }`}
      >
        Log New Transaction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
              isDarkMode ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Description
          </label>

          <input
            ref={deskripsiRef}
            type="text"
            placeholder="e.g., Gaji Bulanan, Kopi"
            className={`block w-full rounded-lg border py-2.5 px-3 text-sm focus:outline-none focus:ring-1 ${
              isDarkMode
                ? "border-zinc-800 bg-zinc-950 text-white placeholder-zinc-600 focus:border-zinc-700 focus:ring-emerald-500"
                : "border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:ring-emerald-600"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
              isDarkMode ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Amount (Rp)
          </label>

          <input
            ref={jumlahRef}
            type="number"
            min="1"
            inputMode="numeric"
            placeholder="0"
            className={`block w-full rounded-lg border py-2.5 px-3 text-sm focus:outline-none focus:ring-1 ${
              isDarkMode
                ? "border-zinc-800 bg-zinc-950 text-white placeholder-zinc-600 focus:border-zinc-700 focus:ring-emerald-500"
                : "border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:ring-emerald-600"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
              isDarkMode ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Type
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipeInput("masuk")}
              className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                tipeInput === "masuk"
                  ? isDarkMode
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold"
                    : "bg-emerald-50 border-emerald-600 text-emerald-700 font-semibold"
                  : isDarkMode
                    ? "bg-zinc-950 border-zinc-800 text-zinc-500"
                    : "bg-zinc-50 border-zinc-200 text-zinc-500"
              }`}
            >
              Inflow
            </button>

            <button
              type="button"
              onClick={() => setTipeInput("keluar")}
              className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                tipeInput === "keluar"
                  ? isDarkMode
                    ? "bg-rose-500/10 border-rose-500 text-rose-400 font-semibold"
                    : "bg-rose-50 border-rose-600 text-rose-700 font-semibold"
                  : isDarkMode
                    ? "bg-zinc-950 border-zinc-800 text-zinc-500"
                    : "bg-zinc-50 border-zinc-200 text-zinc-500"
              }`}
            >
              Outflow
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full mt-2 text-xs font-medium py-2.5 rounded-lg transition-all ${
            isDarkMode
              ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
              : "bg-zinc-900 hover:bg-zinc-800 text-white"
          }`}
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
});

interface WishlistTargetProps {
  isDarkMode: boolean;
  namaBarang: string;
  hargaBarang: number;
  komitmenNabung: number;
  kekuranganUang: number;
  estimasiBulan: number;
  onNamaBarangChange: (value: string) => void;
  onHargaBarangChange: (value: number) => void;
  onKomitmenChange: (value: number) => void;
}

const WishlistTarget = memo(function WishlistTarget({
  isDarkMode,
  namaBarang,
  hargaBarang,
  komitmenNabung,
  kekuranganUang,
  estimasiBulan,
  onNamaBarangChange,
  onHargaBarangChange,
  onKomitmenChange,
}: WishlistTargetProps) {
  return (
    <div
      className={`border rounded-xl p-6 transition-all space-y-4 ${
        isDarkMode
          ? "bg-zinc-900/50 border-zinc-800"
          : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      <h2
        className={`text-xs font-bold uppercase tracking-wider ${
          isDarkMode ? "text-zinc-100" : "text-zinc-800"
        }`}
      >
        Wishlist Target
      </h2>

      <div className="space-y-4">
        <div>
          <label
            className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
              isDarkMode ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Item Name
          </label>

          <input
            type="text"
            value={namaBarang}
            placeholder="e.g., PlayStation 5 Pro"
            onChange={(event) => onNamaBarangChange(event.target.value)}
            className={`block w-full rounded-lg border py-2.5 px-3 text-sm focus:outline-none focus:ring-1 ${
              isDarkMode
                ? "border-zinc-800 bg-zinc-950 text-white placeholder-zinc-600 focus:border-zinc-700 focus:ring-zinc-500"
                : "border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:ring-zinc-600"
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
                isDarkMode ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Price (Rp)
            </label>

            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={hargaBarang || ""}
              placeholder="0"
              onChange={(event) =>
                onHargaBarangChange(Number(event.target.value) || 0)
              }
              className={`block w-full rounded-lg border py-2.5 px-3 text-sm focus:outline-none focus:ring-1 ${
                isDarkMode
                  ? "border-zinc-800 bg-zinc-950 text-white placeholder-zinc-600 focus:border-zinc-700 focus:ring-zinc-500"
                  : "border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:ring-zinc-600"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-xs font-medium mb-2 uppercase tracking-wide ${
                isDarkMode ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Commitment
            </label>

            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={komitmenNabung || ""}
              placeholder="/bln"
              onChange={(event) =>
                onKomitmenChange(Number(event.target.value) || 0)
              }
              className={`block w-full rounded-lg border py-2.5 px-3 text-sm focus:outline-none focus:ring-1 ${
                isDarkMode
                  ? "border-zinc-800 bg-zinc-950 text-white placeholder-zinc-600 focus:border-zinc-700 focus:ring-zinc-500"
                  : "border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:ring-zinc-600"
              }`}
            />
          </div>
        </div>
      </div>

      {namaBarang && hargaBarang > 0 && (
        <div
          className={`mt-4 pt-4 border-t ${
            isDarkMode ? "border-zinc-800" : "border-zinc-100"
          }`}
        >
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium mb-2">
            Financial Timeline Simulation
          </p>

          <div
            className={`p-3.5 rounded-lg space-y-2 ${
              isDarkMode
                ? "bg-zinc-950 border border-zinc-800"
                : "bg-zinc-50 border border-zinc-100"
            }`}
          >
            <p
              className={`font-semibold text-xs ${
                isDarkMode ? "text-white" : "text-zinc-900"
              }`}
            >
              {namaBarang}
            </p>

            {kekuranganUang <= 0 ? (
              <p className="text-emerald-500 font-medium text-[11px]">
                ✓ Saldo mencukupi untuk bayar tunai!
              </p>
            ) : (
              <div className="space-y-2 text-[11px]">
                <p className="text-zinc-500">
                  Kekurangan:{" "}
                  <span className="font-mono font-bold text-rose-500">
                    Rp {formatRupiah(kekuranganUang)}
                  </span>
                </p>

                {komitmenNabung > 0 && (
                  <div
                    className={`p-2 rounded border text-[11px] font-medium ${
                      isDarkMode
                        ? "bg-indigo-950/20 border-indigo-900/40 text-indigo-300"
                        : "bg-indigo-50 border-indigo-100 text-indigo-700"
                    }`}
                  >
                    🚀 Target tercapai dalam{" "}
                    <span className="font-bold">{estimasiBulan} bulan</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

interface WalletSummaryProps {
  isDarkMode: boolean;
  totalPemasukan: number;
  totalPengeluaran: number;
  sisaTabungan: number;
}

const WalletSummary = memo(function WalletSummary({
  isDarkMode,
  totalPemasukan,
  totalPengeluaran,
  sisaTabungan,
}: WalletSummaryProps) {
  return (
    <div
      className={`border rounded-xl p-6 flex flex-col justify-between transition-all ${
        isDarkMode
          ? "bg-zinc-900/50 border-zinc-800"
          : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      <div
        className={`grid grid-cols-2 gap-2 border-b pb-4 text-xs ${
          isDarkMode ? "border-zinc-800/60" : "border-zinc-100"
        }`}
      >
        <div>
          <p className="text-zinc-500 uppercase tracking-wider font-medium text-[10px]">
            Total Inflow
          </p>

          <p className="text-emerald-600 font-semibold text-xs mt-0.5">
            Rp {formatRupiah(totalPemasukan)}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 uppercase tracking-wider font-medium text-[10px]">
            Total Outflow
          </p>

          <p className="text-rose-600 font-semibold text-xs mt-0.5">
            Rp {formatRupiah(totalPengeluaran)}
          </p>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
          Net Savings Balance
        </p>

        <p
          className={`text-xl font-semibold tracking-tight mt-1 ${
            sisaTabungan >= 0
              ? isDarkMode
                ? "text-white"
                : "text-zinc-900"
              : "text-rose-500"
          }`}
        >
          Rp {formatRupiah(sisaTabungan)}
        </p>
      </div>
    </div>
  );
});

interface WalletRatioProps {
  isDarkMode: boolean;
  hasTransactions: boolean;
  chartData: { name: string; value: number }[];
}

const WalletRatio = memo(function WalletRatio({
  isDarkMode,
  hasTransactions,
  chartData,
}: WalletRatioProps) {
  const colors = isDarkMode ? DARK_CHART_COLORS : LIGHT_CHART_COLORS;

  return (
    <div
      className={`border rounded-xl p-6 transition-all ${
        isDarkMode
          ? "bg-zinc-900/50 border-zinc-800"
          : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
        Wallet Ratio
      </h3>

      {hasTransactions ? (
        <div className="flex items-center justify-between h-20">
          <div className="h-20 w-20 flex items-center justify-center">
            <PieChart width={80} height={80}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={22}
                outerRadius={30}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </div>

          <div className="text-right text-[10px] space-y-0.5 text-zinc-500 font-medium">
            <p>
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                  isDarkMode ? "bg-emerald-500" : "bg-emerald-600"
                }`}
              />
              Savings
            </p>

            <p>
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                  isDarkMode ? "bg-rose-500" : "bg-rose-600"
                }`}
              />
              Outflow
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-zinc-400 italic text-center py-4">
          No data analytics.
        </p>
      )}
    </div>
  );
});

interface TransactionHistoryProps {
  isDarkMode: boolean;
  transaksiList: Transaksi[];
  onDelete: (id: string) => void;
}

const TransactionHistory = memo(function TransactionHistory({
  isDarkMode,
  transaksiList,
  onDelete,
}: TransactionHistoryProps) {
  const displayedTransactions = useMemo(() => {
    return transaksiList.slice(0, MAX_VISIBLE_TRANSACTIONS);
  }, [transaksiList]);

  return (
    <div
      className={`border rounded-xl p-6 transition-all ${
        isDarkMode
          ? "bg-zinc-900/50 border-zinc-800"
          : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Transaction History
        </h2>

        {transaksiList.length > MAX_VISIBLE_TRANSACTIONS && (
          <span className="text-[10px] text-zinc-500">
            Menampilkan {MAX_VISIBLE_TRANSACTIONS} terbaru
          </span>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {transaksiList.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-8">
            Belum ada transaksi tercatat.
          </p>
        ) : (
          displayedTransactions.map((transaksi) => (
            <div
              key={transaksi.id}
              className={`flex items-center justify-between p-2.5 border rounded-lg group ${
                isDarkMode
                  ? "bg-zinc-950/40 border-zinc-800"
                  : "bg-zinc-50 border-zinc-100"
              }`}
            >
              <div className="text-xs">
                <p
                  className={`font-medium ${
                    isDarkMode ? "text-zinc-200" : "text-zinc-800"
                  }`}
                >
                  {transaksi.deskripsi}
                </p>

                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {transaksi.tanggal}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-semibold ${
                    transaksi.tipe === "masuk"
                      ? isDarkMode
                        ? "text-emerald-400"
                        : "text-emerald-600"
                      : isDarkMode
                        ? "text-rose-400"
                        : "text-rose-600"
                  }`}
                >
                  {transaksi.tipe === "masuk" ? "+" : "-"} Rp{" "}
                  {formatRupiah(transaksi.jumlah)}
                </span>

                <button
                  aria-label={`Hapus transaksi ${transaksi.deskripsi}`}
                  onClick={() => onDelete(transaksi.id)}
                  className="text-zinc-400 hover:text-rose-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

interface FinancialStatusProps {
  isDarkMode: boolean;
  hasTransactions: boolean;
  rasioPengeluaran: number;
}

const FinancialStatus = memo(function FinancialStatus({
  isDarkMode,
  hasTransactions,
  rasioPengeluaran,
}: FinancialStatusProps) {
  return (
    <div
      className={`border rounded-xl p-5 text-xs flex flex-col justify-center ${
        isDarkMode
          ? "bg-zinc-900/30 border-zinc-800"
          : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
        Financial Status
      </span>

      {!hasTransactions ? (
        <p className="text-zinc-500 italic">Belum ada aktivitas finansial.</p>
      ) : rasioPengeluaran >= 75 ? (
        <div
          className={`p-3 rounded-lg border ${
            isDarkMode
              ? "bg-rose-950/20 border-rose-900/40 text-rose-300"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          ⚠️ Outflow lo nembus {rasioPengeluaran.toFixed(0)}%.
        </div>
      ) : rasioPengeluaran >= 50 ? (
        <div
          className={`p-3 rounded-lg border ${
            isDarkMode
              ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          📊 Pengeluaran udah {rasioPengeluaran.toFixed(0)}%.
        </div>
      ) : (
        <div
          className={`p-3 rounded-lg border ${
            isDarkMode
              ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          ✨ Pengeluaran di bawah 50%. Mantap!
        </div>
      )}
    </div>
  );
});

interface SmartTipsProps {
  isDarkMode: boolean;
  sisaTabungan: number;
}

const SmartTips = memo(function SmartTips({
  isDarkMode,
  sisaTabungan,
}: SmartTipsProps) {
  return (
    <div
      className={`border rounded-xl p-5 text-xs flex flex-col justify-center ${
        isDarkMode
          ? "bg-zinc-900/30 border-zinc-800"
          : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5 block">
        fintrack Smart Tips
      </h3>

      <div
        className={`leading-relaxed p-3 rounded-lg border text-[11px] ${
          isDarkMode
            ? "bg-zinc-950 text-zinc-400 border-zinc-800"
            : "bg-zinc-50 text-zinc-600 border-zinc-200"
        }`}
      >
        {sisaTabungan <= 0 ? (
          <span>💡 Tabungan kosong. Pangkas pengeluaran sekunder secepatnya.</span>
        ) : sisaTabungan < 2000000 ? (
          <span>💡 Amankan sisa tabungan lo ini ke akun Dana Darurat terpisah.</span>
        ) : (
          <span>💡 Alokasikan sisa dana lo ke instrumen investasi produktif.</span>
        )}
      </div>
    </div>
  );
});

export default function Home() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [namaBarang, setNamaBarang] = useState("");
  const [hargaBarang, setHargaBarang] = useState(0);
  const [komitmenNabung, setKomitmenNabung] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTransaksi = localStorage.getItem("fintrack_transaksi");
    const savedNamaBarang = localStorage.getItem("fintrack_namaBarang");
    const savedHargaBarang = localStorage.getItem("fintrack_hargaBarang");
    const savedKomitmen = localStorage.getItem("fintrack_komitmen");
    const savedTheme = localStorage.getItem("fintrack_theme");

    setTransaksiList(safeParseTransactions(savedTransaksi));

    if (savedNamaBarang) {
      setNamaBarang(savedNamaBarang);
    }

    if (savedHargaBarang) {
      setHargaBarang(Number(savedHargaBarang) || 0);
    }

    if (savedKomitmen) {
      setKomitmenNabung(Number(savedKomitmen) || 0);
    }

    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }

    setIsLoaded(true);
  }, []);

  // Hanya simpan transaksi ketika daftar transaksi berubah.
  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      localStorage.setItem(
        "fintrack_transaksi",
        JSON.stringify(transaksiList),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [transaksiList, isLoaded]);

  // Simpan setting tanpa ikut stringify seluruh transaksi.
  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      localStorage.setItem("fintrack_namaBarang", namaBarang);
      localStorage.setItem("fintrack_hargaBarang", String(hargaBarang));
      localStorage.setItem("fintrack_komitmen", String(komitmenNabung));
      localStorage.setItem(
        "fintrack_theme",
        isDarkMode ? "dark" : "light",
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [namaBarang, hargaBarang, komitmenNabung, isDarkMode, isLoaded]);

  const handleAddTransaction = useCallback((data: NewTransactionData) => {
    const transaksiBaru: Transaksi = {
      id: generateId(),
      deskripsi: data.deskripsi,
      jumlah: data.jumlah,
      tipe: data.tipe,
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
    };

    setTransaksiList((previous) => [transaksiBaru, ...previous]);
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransaksiList((previous) =>
      previous.filter((transaksi) => transaksi.id !== id),
    );
  }, []);

  const handleToggleTheme = useCallback(() => {
    setIsDarkMode((previous) => !previous);
  }, []);

  const handleResetData = useCallback(() => {
    const confirmed = window.confirm(
      "Serius mau reset semua data transaksi dan target lo?",
    );

    if (!confirmed) return;

    setTransaksiList([]);
    setNamaBarang("");
    setHargaBarang(0);
    setKomitmenNabung(0);
    setIsDarkMode(true);
  }, []);

  const handleNamaBarangChange = useCallback((value: string) => {
    setNamaBarang(value);
  }, []);

  const handleHargaBarangChange = useCallback((value: number) => {
    setHargaBarang(value);
  }, []);

  const handleKomitmenChange = useCallback((value: number) => {
    setKomitmenNabung(value);
  }, []);

  // Hanya dihitung ulang ketika transaksi berubah.
  const financialSummary = useMemo(() => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    for (const transaksi of transaksiList) {
      if (transaksi.tipe === "masuk") {
        totalPemasukan += transaksi.jumlah;
      } else {
        totalPengeluaran += transaksi.jumlah;
      }
    }

    const sisaTabungan = totalPemasukan - totalPengeluaran;
    const rasioPengeluaran =
      totalPemasukan > 0
        ? (totalPengeluaran / totalPemasukan) * 100
        : 0;

    return {
      totalPemasukan,
      totalPengeluaran,
      sisaTabungan,
      rasioPengeluaran,
    };
  }, [transaksiList]);

  // Kalkulasi wishlist tidak lagi memaksa seluruh transaksi dihitung ulang.
  const wishlistSummary = useMemo(() => {
    const kekuranganUang = hargaBarang - financialSummary.sisaTabungan;

    const estimasiBulan =
      komitmenNabung > 0 && kekuranganUang > 0
        ? Math.ceil(kekuranganUang / komitmenNabung)
        : 0;

    return {
      kekuranganUang,
      estimasiBulan,
    };
  }, [hargaBarang, komitmenNabung, financialSummary.sisaTabungan]);

  const chartData = useMemo(
    () => [
      {
        name: "Sisa Tabungan",
        value:
          financialSummary.sisaTabungan > 0
            ? financialSummary.sisaTabungan
            : 0,
      },
      {
        name: "Pengeluaran",
        value: financialSummary.totalPengeluaran,
      },
    ],
    [financialSummary.sisaTabungan, financialSummary.totalPengeluaran],
  );

  if (!isLoaded) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center font-sans ${
          isDarkMode
            ? "bg-zinc-950 text-zinc-400"
            : "bg-zinc-50 text-zinc-500"
        }`}
      >
        <div className="animate-pulse text-xs tracking-widest uppercase">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen font-sans antialiased transition-colors duration-200 ${
        isDarkMode
          ? "bg-zinc-950 text-zinc-200"
          : "bg-zinc-50 text-zinc-800"
      }`}
    >
      <div
        className={`h-[3px] w-full ${
          isDarkMode ? "bg-emerald-500" : "bg-emerald-600"
        }`}
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onResetData={handleResetData}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <TransactionForm
              isDarkMode={isDarkMode}
              onAddTransaction={handleAddTransaction}
            />

            <WishlistTarget
              isDarkMode={isDarkMode}
              namaBarang={namaBarang}
              hargaBarang={hargaBarang}
              komitmenNabung={komitmenNabung}
              kekuranganUang={wishlistSummary.kekuranganUang}
              estimasiBulan={wishlistSummary.estimasiBulan}
              onNamaBarangChange={handleNamaBarangChange}
              onHargaBarangChange={handleHargaBarangChange}
              onKomitmenChange={handleKomitmenChange}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WalletSummary
                isDarkMode={isDarkMode}
                totalPemasukan={financialSummary.totalPemasukan}
                totalPengeluaran={financialSummary.totalPengeluaran}
                sisaTabungan={financialSummary.sisaTabungan}
              />

              <WalletRatio
                isDarkMode={isDarkMode}
                hasTransactions={transaksiList.length > 0}
                chartData={chartData}
              />
            </div>

            <TransactionHistory
              isDarkMode={isDarkMode}
              transaksiList={transaksiList}
              onDelete={handleDeleteTransaction}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FinancialStatus
                isDarkMode={isDarkMode}
                hasTransactions={transaksiList.length > 0}
                rasioPengeluaran={financialSummary.rasioPengeluaran}
              />

              <SmartTips
                isDarkMode={isDarkMode}
                sisaTabungan={financialSummary.sisaTabungan}
              />
            </div>
          </div>
        </div>

        <footer
          className={`mt-24 border-t pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 ${
            isDarkMode ? "border-zinc-900" : "border-zinc-200"
          }`}
        >
          <p>© {new Date().getFullYear()} fintrack</p>

          <div className="flex gap-4 mt-2 sm:mt-0 items-center">
            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-zinc-400 transition-colors"
            >
              <FaGithub className="text-sm" /> GitHub Repository
            </a>

            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-zinc-400 transition-colors"
            >
              <FaBook className="text-sm" /> Documentation
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}