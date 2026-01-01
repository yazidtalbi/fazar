"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Trash2, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

export function AddressManagement(): React.ReactElement {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    country: "Maroc",
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function openAddDialog() {
    setEditingAddress(null);
    setFormData({
      full_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      postal_code: "",
      country: "Maroc",
      is_default: false,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(address: Address) {
    setEditingAddress(address);
    setFormData({
      full_name: address.full_name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      postal_code: address.postal_code || "",
      country: address.country,
      is_default: address.is_default,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingAddress
        ? `/api/addresses/${editingAddress.id}`
        : "/api/addresses";
      const method = editingAddress ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      await loadAddresses();
      setIsDialogOpen(false);
      toast.success(editingAddress ? "Address updated" : "Address added");
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error("Failed to save address");
    }
  }

  async function handleDelete(addressId: string) {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      await loadAddresses();
      toast.success("Address deleted");
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error("Failed to delete address");
    }
  }

  async function handleSetDefault(addressId: string) {
    try {
      const response = await fetch(`/api/addresses/${addressId}/set-default`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to set default address");
      }

      await loadAddresses();
      toast.success("Default address updated");
    } catch (error) {
      console.error("Failed to set default address:", error);
      toast.error("Failed to set default address");
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading addresses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Vos adresses de livraison</h2>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une nouvelle adresse
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No addresses saved</p>
            <Button onClick={openAddDialog}>Add Your First Address</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  {address.is_default && (
                    <Badge className="mb-2">Défaut</Badge>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(address)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="flex items-center gap-2 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">{address.full_name}</p>
                  <p className="text-sm text-muted-foreground">{address.address_line1}</p>
                  {address.address_line2 && (
                    <p className="text-sm text-muted-foreground">{address.address_line2}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {address.postal_code && `${address.postal_code} `}
                    {address.city}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.country}</p>
                </div>
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Modifier l'adresse" : "Nouvelle adresse"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <select
                id="country"
                className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              >
                <option value="Maroc">Maroc</option>
                <option value="Algérie">Algérie</option>
                <option value="Tunisie">Tunisie</option>
                <option value="France">France</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line1">Adresse</Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line2">
                Appartement / Etage / Autre (facultatif)
              </Label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal (facultatif)</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_default" className="text-sm">
                Sélectionner par défaut
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

