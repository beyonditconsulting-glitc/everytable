"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Modal } from "@/components/Modal";
import { StoreForm, type StoreFormValues } from "@/components/StoreForm";
import { SearchForm } from "@/components/SearchForm";
import { LeadCard } from "@/components/LeadCard";
import { useActiveStore } from "@/lib/useActiveStore";
import type { Lead, LeadCategory, LeadSource } from "@/lib/types";

export default function Home() {
  const { stores, activeStore, activeStoreId, setActiveStoreId, loading, refreshStores } =
    useActiveStore();

  const [showAddStore, setShowAddStore] = useState(false);
  const [showEditStore, setShowEditStore] = useState(false);

  const [searching, setSearching] = useState(false);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [leadSource, setLeadSource] = useState<LeadSource | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

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

  async function handleSearch(radiusMiles: number, categories: LeadCategory[]) {
    if (!activeStoreId) return;
    setSearching(true);
    setSearchError(null);
    setWarning(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: activeStoreId, radiusMiles, categories }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setLeads(data.leads);
      setLeadSource(data.source);
      setWarning(data.warning ?? null);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-stone-500">Loading...</div>;
  }

  if (stores.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-2xl font-bold text-stone-900">
          Set up your store
        </h1>
        <p className="mt-2 text-stone-500">
          Add your store details once — you&apos;ll reuse this to find
          nearby leads and generate flyers and emails.
        </p>
        <div className="card mt-6">
          <StoreForm submitLabel="Create store" onSubmit={createStore} />
        </div>
      </main>
    );
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

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <SearchForm loading={searching} onSearch={handleSearch} />

        {searchError && (
          <p className="text-sm text-red-600">{searchError}</p>
        )}

        {warning && (
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {warning}
          </div>
        )}

        {leads && leadSource === "osm" && (
          <p className="text-xs text-stone-400">
            Showing live results from OpenStreetMap.
          </p>
        )}
        {leads && leadSource === "google" && (
          <p className="text-xs text-stone-400">
            Showing live results from Google Places.
          </p>
        )}

        {leads && leads.length === 0 && (
          <p className="text-sm text-stone-500">
            No businesses found in this radius. Try a larger radius or more
            business types.
          </p>
        )}

        {leads && leads.length > 0 && activeStoreId && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} storeId={activeStoreId} />
            ))}
          </div>
        )}
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
