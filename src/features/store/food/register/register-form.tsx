"use client";

import { RegisterLane } from "@/lib/db/schema";
import { useState, useActionState, useMemo, useEffect } from "react";
import { processRegisterAndStock, RegisterAndStockState } from "./action";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { FieldError } from "@/components/ui/field-error";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";

type DisplayItem = {
  id: string;
  foodId: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean | null;
  storeName: string;
};

type Props = {
  items: DisplayItem[];
  lanes: RegisterLane[];
  foodOptions: FoodOption[];
  defaultFoodId: string;
  isStoreLaneUser: boolean;
};

type FoodOption = {
  foodId: string;
  storeName: string;
  isUseLane: boolean;
};

type Quantities = Record<string, number>;

const INITIAL_STATE: RegisterAndStockState = {
  quantities: {},
  totalAmount: 0,
  amountPaid: "",
  laneId: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function FoodRegisterForm({
  items,
  lanes,
  foodOptions,
  defaultFoodId,
  isStoreLaneUser,
}: Props) {
  const [selectedLaneId, setSelectedLaneId] = useState<string>("none");
  const [selectedFoodId, setSelectedFoodId] = useState<string>(
    isStoreLaneUser ? "none" : defaultFoodId,
  );

  const useLaneFoodIds = useMemo(
    () => foodOptions.filter((f) => f.isUseLane).map((f) => f.foodId),
    [foodOptions],
  );

  const foodItems = useMemo(() => {
    if (selectedFoodId === "none") {
      return items.filter((item) => useLaneFoodIds.includes(item.foodId));
    }
    return items.filter((item) => item.foodId === selectedFoodId);
  }, [items, selectedFoodId, useLaneFoodIds]);

  const [quantities, setQuantities] = useState<Quantities>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}),
  );
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [state, formAction, isPending] = useActionState(
    processRegisterAndStock,
    INITIAL_STATE,
  );

  const [finalAmountPaid, setFinalAmountPaid] = useState(0);
  const [finalTotalAmount, setFinalTotalAmount] = useState(0);

  useEffect(() => {
    if (state?.success) {
      setFinalAmountPaid(parseInt(amountPaid) || 0);
      setFinalTotalAmount(totalAmount);

      setShowPaymentForm(false);
      setQuantities(
        items.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}),
      );
    }
  }, [state?.success]);

  const handleLaneChange = (nextLaneId: string) => {
    setSelectedLaneId(nextLaneId);
    setAmountPaid("");
    setShowPaymentForm(false);
  };

  const handleFoodChange = (nextFoodId: string) => {
    setSelectedFoodId(nextFoodId);

    setQuantities(
      items.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {} as Quantities),
    );

    setAmountPaid("");
    setShowPaymentForm(false);
  };

  const totalAmount = Object.entries(quantities).reduce(
    (sum, [itemId, qty]) => {
      const item = items.find((i) => i.id === itemId);
      return sum + (item?.price || 0) * qty;
    },
    0,
  );

  const hasItems = Object.values(quantities).some((qty) => qty > 0);

  const handleQuantityChange = (itemId: string, value: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const parsedNum = parseInt(value) || 0;
    const num = Math.min(item.stock, Math.max(0, parsedNum));

    setQuantities((prev) => ({ ...prev, [itemId]: num }));
  };

  const handleCheckout = () => {
    if (!hasItems) return;
    setShowPaymentForm(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    formData.set("laneId", selectedLaneId === "none" ? "" : selectedLaneId);
    formData.set("foodId", selectedFoodId === "none" ? "" : selectedFoodId);
    formData.set("totalAmount", String(totalAmount));
    Object.entries(quantities).forEach(([itemId, qty]) => {
      formData.set(`quantity_${itemId}`, String(qty));
    });
    await formAction(formData);
  };

  const handleReset = () => {
    setAmountPaid("");
    setFinalAmountPaid(0);
    setFinalTotalAmount(0);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Field className="mb-4">
              <FieldLabel>会計レーン</FieldLabel>
              <Select
                name="laneId"
                value={selectedLaneId}
                onValueChange={handleLaneChange}
                disabled={isPending || showPaymentForm || state?.success}
              >
                <SelectTrigger>
                  <SelectValue placeholder="レーンを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">レーン無し</SelectItem>
                    {lanes.map((lane) => (
                      <SelectItem key={lane.id} value={lane.id}>
                        レーン {lane.laneNumber}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="mb-4">
              <FieldLabel>模擬店</FieldLabel>
              <Select
                name="foodId"
                value={selectedFoodId}
                onValueChange={handleFoodChange}
                disabled={isPending || showPaymentForm || state?.success}
              >
                <SelectTrigger>
                  <SelectValue placeholder="模擬店を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">
                      模擬店未選択（全レーン対象店）
                    </SelectItem>
                    {foodOptions.map((f) => (
                      <SelectItem key={f.foodId} value={f.foodId}>
                        {f.storeName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <h3 className="font-semibold mb-4">販売商品を選択</h3>
            <FieldGroup>
              {foodItems.length > 0 ? (
                foodItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">
                        {item.storeName}
                      </span>
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.price}円 / 在庫: {item.stock}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            String(Math.max(0, (quantities[item.id] || 0) - 1)),
                          )
                        }
                        disabled={showPaymentForm || state?.success}
                        size="sm"
                      >
                        −
                      </Button>
                      <div className="w-12 text-center text-lg font-semibold">
                        {quantities[item.id] || 0}
                      </div>
                      <Button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            String((quantities[item.id] || 0) + 1),
                          )
                        }
                        disabled={
                          showPaymentForm ||
                          state?.success ||
                          (quantities[item.id] || 0) >= item.stock
                        }
                        size="sm"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <NotFoundPrompt context="条件に合う商品" />
              )}
            </FieldGroup>
          </div>

          <FieldSeparator />

          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="text-lg font-semibold">
              合計金額: {totalAmount.toLocaleString()}円
            </div>
          </div>

          {!showPaymentForm && !state?.success && (
            <Button
              onClick={handleCheckout}
              disabled={!hasItems}
              className="w-full"
            >
              会計へ進む
            </Button>
          )}

          {showPaymentForm && (
            <form action={handleFormSubmit}>
              <input
                type="hidden"
                name="laneId"
                value={selectedLaneId === "none" ? "" : selectedLaneId}
              />
              <FieldSet>
                <Field>
                  <FieldLabel>受取金額</FieldLabel>
                  <Input
                    name="amountPaid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    disabled={isPending}
                    required
                  />
                  <FieldError message={state.zodErrors?.amountPaid?.[0]} />
                  {amountPaid && parseInt(amountPaid) < totalAmount && (
                    <FieldError
                      message={`合計金額(${totalAmount.toLocaleString()}円)未満です`}
                    />
                  )}
                </Field>
              </FieldSet>

              <FieldSeparator />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                  disabled={isPending}
                  className="flex-1"
                >
                  戻る
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    !amountPaid ||
                    parseInt(amountPaid) < totalAmount
                  }
                  className="flex-1"
                >
                  {isPending ? "確定中..." : "確定"}
                </Button>
              </div>
            </form>
          )}

          {state?.success && (
            <div>
              <MessagePrompt message={state.message} />
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-gray-600">おつり</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(finalAmountPaid - finalTotalAmount).toLocaleString()}円
                </div>
              </div>
            </div>
          )}
          {!state?.success && state?.message && (
            <ErrorPrompt error={state.message} />
          )}

          {state?.success && (
            <Button onClick={handleReset} className="w-full">
              別の会計を開始
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
