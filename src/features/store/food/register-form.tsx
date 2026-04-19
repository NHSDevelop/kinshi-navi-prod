"use client";

import { Item } from "@/lib/db/schema";
import { useState, useActionState } from "react";
import {
  processRegisterAndStock,
  RegisterAndStockState,
} from "./register/action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Props = {
  foodId: string;
  items: Item[];
};

type Quantities = Record<string, number>;

const INITIAL_STATE: RegisterAndStockState = {
  quantities: {},
  totalAmount: 0,
  amountPaid: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function FoodRegisterForm({ foodId, items }: Props) {
  const [quantities, setQuantities] = useState<Quantities>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}),
  );
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [state, formAction, isPending] = useActionState(
    processRegisterAndStock,
    INITIAL_STATE,
  );

  const totalAmount = Object.entries(quantities).reduce(
    (sum, [itemId, qty]) => {
      const item = items.find((i) => i.id === itemId);
      return sum + (item?.price || 0) * qty;
    },
    0,
  );

  const hasItems = Object.values(quantities).some((qty) => qty > 0);

  const handleQuantityChange = (itemId: string, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setQuantities((prev) => ({ ...prev, [itemId]: num }));
  };

  const handleCheckout = () => {
    if (!hasItems) {
      return;
    }
    setShowPaymentForm(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    formData.set("foodId", foodId);
    formData.set("totalAmount", String(totalAmount));
    Object.entries(quantities).forEach(([itemId, qty]) => {
      formData.set(`quantity_${itemId}`, String(qty));
    });
    await formAction(formData);
  };

  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          {/* 数量選択セクション */}
          <div>
            <h3 className="font-semibold mb-4">販売商品を選択</h3>
            <FieldGroup>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg"
                >
                  <div>{item.name}</div>
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
                      disabled={showPaymentForm}
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
                        (quantities[item.id] || 0) >= item.stock
                      }
                      size="sm"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </FieldGroup>
          </div>

          <FieldSeparator />

          {/* 合計金額表示 */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="text-lg font-semibold">
              合計金額: {totalAmount.toLocaleString()}円
            </div>
          </div>

          {/* 会計ボタン */}
          {!showPaymentForm && (
            <Button
              onClick={handleCheckout}
              disabled={!hasItems}
              className="w-full"
            >
              会計へ進む
            </Button>
          )}

          {/* 受取金額フォーム */}
          {showPaymentForm && (
            <form action={handleFormSubmit}>
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

          {/* メッセージ表示 */}
          {state?.success && (
            <div>
              <MessagePrompt message={state.message} />
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-gray-600">おつり</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(parseInt(amountPaid) - totalAmount).toLocaleString()}円
                </div>
              </div>
            </div>
          )}
          {!state?.success && state?.message && (
            <ErrorPrompt error={state.message} />
          )}

          {/* 成功後はリセット */}
          {state?.success && (
            <Button
              onClick={() => {
                window.location.reload();
                setAmountPaid("");
              }}
            >
              別の会計を開始
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
