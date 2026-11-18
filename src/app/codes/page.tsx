"use client";

import { useCallback, useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Modal } from "@/components/Modal";
import { StoreForm, type StoreFormValues } from "@/components/StoreForm";
import { useActiveStore } from "@/lib/useActiveStore";
import type { PromoCode } from "@/lib/types";

export default function CodesPage() {
  const { stores, activeStore, activeStoreId, setActiveStoreId, loading, refreshStores } =
    useActiveStore();

  const [codes, setCodes] = useState<PromoCode[] | null>(null);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showEditStore, setShowEditStore] = useState(false);

  const loadCodes = useCallback(async () => {
    if (!activeStoreId) return;
    const res = await fetch(`/api/codes?storeId=${activeStoreId}`);
    const data = await res.json();
    setCodes(data.codes ?? []);
  }, [activeStoreId]);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  async function handleRedeem(code: string) {
    if (!activeStoreId) return;
    const res = await fetch("/api/codes/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: activeStoreId, code }),
    });
    if (res.ok) await loadCodes();
  }

  async function createStore(values: StoreFormValues) {
    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not create store");
    await refreshStores();
    setActiveStoreId(data.store.id);
    setShowAddStore(false);
  }

  async function editStore(values: StoreFormValues) {
    if (!activeStore) return;
    const res = await fetch(`/api/stores/${activeStore.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Could not update store");
    await refreshStores();
    setShowEditStore(false);
  }

  if (loading) {
    return <div className="p-10 text-stone-500">Loading...</div>;
  }

  return (
    <>
      <Nav
        stores={stores}
        activeStoreId={activeStoreId}
        onChangeStore={setActiveStoreId}
        onAddStore={() => setShowAddStore(true)}
        onEditStore={() => setShowEditStore(true)}
      />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-xl font-bold text-stone-900">Promo codes</h1>
        <p className="mt-1 text-sm text-stone-500">
          Every code generated from a flyer or email for this store. Mark a
          redemption when a customer uses their code at checkout.
        </p>

        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2 pr-4 font-medium">Code</th>
                <th className="py-2 pr-4 font-medium">Business</th>
                <th className="py-2 pr-4 font-medium">Sent via</th>
                <th className="py-2 pr-4 font-medium">Created</th>
                <th className="py-2 pr-4 font-medium">Redemptions</th>
                <th className="py-2 pr-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {codes?.map((c) => (
                <tr key={c.code} className="border-b border-stone-100">
                  <td className="py-2 pr-4 font-mono font-semibold text-stone-900">
                    {c.code}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="text-stone-900">{c.leadName}</div>
                    <div className="text-xs text-stone-500">{c.leadAddress}</div>
                  </td>
                  <td className="py-2 pr-4 text-stone-600">
                    {c.channels.join(", ")}
                  </td>
                  <td className="py-2 pr-4 text-stone-600">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-4 text-stone-900">{c.timesRedeemed}</td>
                  <td className="py-2 pr-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleRedeem(c.code)}
                    >
                      + Mark redeemed
                    </button>
                  </td>
                </tr>
              ))}
              {codes && codes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    No promo codes generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showAddStore && (
        <Modal title="Add a store" onClose={() => setShowAddStore(false)}>
          <StoreForm
            submitLabel="Create store"
            onSubmit={createStore}
            onCancel={() => setShowAddStore(false)}
          />
        </Modal>
      )}

      {showEditStore && activeStore && (
        <Modal title="Edit store" onClose={() => setShowEditStore(false)}>
          <StoreForm
            initial={activeStore}
            submitLabel="Save changes"
            onSubmit={editStore}
            onCancel={() => setShowEditStore(false)}
          />
        </Modal>
      )}
    </>
  );
}
