export const TICKET_STATUS_MAP = {
  ISSUED: { label: "発券済み" },
  CALLED: { label: "呼出中" },
  COMPLETED: { label: "完了" },
  CANCELED: { label: "キャンセル" },
  DISABLED: { label: "無効" },
} as const;

export const STORE_TYPE_MAP = {
  ATTRACTION: { label: "企画" },
  FOOD: { label: "模擬店" },
};

export const ADMIN_ROLE_MAP = {
  SUPER_ADMIN: { label: "システム管理者" },
  ORGANIZATION_ADMIN: { label: "組織管理者" },
  EVENT_ADMIN: { label: "イベント管理者" },
  STORE_ADMIN: { label: "店舗管理者" },
} as const;

export type FormState<T = unknown> = {
  success: boolean;
  message?: string | null;
  error?: string | null;
  data?: T;
};

export const FOOD_TAG_MAP = {
  CLASS_BOOTH: { label: "クラス販売" },
  CONCIL_BOOTH: { label: "生徒会販売" },
  OTHER: { label: "その他" },
};
