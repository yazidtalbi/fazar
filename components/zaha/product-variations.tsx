"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";

interface Variation {
  id: string;
  name: string;
  display_name: string | null;
  is_required: boolean;
  options: Array<{
    id: string;
    value: string;
    display_value: string | null;
    price_modifier: number;
  }>;
}

interface Personalization {
  id: string;
  label: string;
  placeholder: string | null;
  max_length: number;
  is_required: boolean;
  price_modifier: number;
}

interface ProductVariationsProps {
  variations: Variation[];
  personalizations: Personalization[];
  onVariationChange?: (variationId: string, optionId: string) => void;
  onPersonalizationChange?: (personalizationId: string, value: string) => void;
}

export function ProductVariations({
  variations,
  personalizations,
  onVariationChange,
  onPersonalizationChange,
}: ProductVariationsProps): React.ReactElement {
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [personalizationValues, setPersonalizationValues] = useState<Record<string, string>>({});

  function handleVariationSelect(variationId: string, optionId: string) {
    setSelectedVariations({ ...selectedVariations, [variationId]: optionId });
    onVariationChange?.(variationId, optionId);
  }

  function handlePersonalizationChange(personalizationId: string, value: string) {
    setPersonalizationValues({ ...personalizationValues, [personalizationId]: value });
    onPersonalizationChange?.(personalizationId, value);
  }

  return (
    <div className="space-y-6">
      {/* Variations */}
      {variations.map((variation) => (
        <div key={variation.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={`variation-${variation.id}`}>
              {variation.display_name || variation.name}
            </Label>
            {variation.is_required && <span className="text-red-500">*</span>}
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <select
            id={`variation-${variation.id}`}
            value={selectedVariations[variation.id] || ""}
            onChange={(e) => handleVariationSelect(variation.id, e.target.value)}
            className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            required={variation.is_required}
          >
            <option value="">Sélectionner une option</option>
            {variation.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.display_value || option.value}
                {option.price_modifier > 0 && ` (+${option.price_modifier.toFixed(2)} ${"MAD"})`}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Personalizations */}
      {personalizations.map((personalization) => (
        <div key={personalization.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor={`personalization-${personalization.id}`}>
                {personalization.label}
              </Label>
              {personalization.is_required && <span className="text-red-500">*</span>}
            </div>
            {personalization.price_modifier > 0 && (
              <span className="text-sm text-muted-foreground">
                +{personalization.price_modifier.toFixed(2)} {"MAD"}
              </span>
            )}
          </div>
          <input
            id={`personalization-${personalization.id}`}
            type="text"
            value={personalizationValues[personalization.id] || ""}
            onChange={(e) => {
              const value = e.target.value.slice(0, personalization.max_length);
              handlePersonalizationChange(personalization.id, value);
            }}
            placeholder={personalization.placeholder || "Enter text"}
            maxLength={personalization.max_length}
            required={personalization.is_required}
            className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            {personalizationValues[personalization.id]?.length || 0} / {personalization.max_length} characters
          </p>
        </div>
      ))}
    </div>
  );
}

