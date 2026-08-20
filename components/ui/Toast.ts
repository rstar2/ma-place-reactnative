// import * as Burnt from "burnt";
// Burnt on Android is just ToastAndroid, no custom props, just title
// Burnt.toast({
//     title: "Burnt installed",
//     message: "Place is added",
//     preset: "done",
//     duration: 10,
//   });

// so use ting
import { theme } from "@/constants/theme";
import { dismissAlert, setup, toast } from "@baronha/ting";

setup({
  toast: {
    titleColor: theme.colors.accent,
    messageColor: theme.colors.accent,
    icon: {
      tintColor: theme.colors.accent,
    },
    backgroundColor: theme.colors.card,
    shouldDismissByDrag: true,
    // ... more and more
    duration: 3,
  },
  alert: {
    // ... alert's option
    shouldDismissByTap: true,
  },
});

const Toast = {
  success(title: string, message?: string, duration?: number) {
    toast({
      title,
      message,
      duration,
      preset: "done",
      backgroundColor: theme.colors.toast.success,
      titleColor: theme.colors.success,
      messageColor: theme.colors.success,
      icon: {
        tintColor: theme.colors.success,
      },
    });
  },
  error(title: string, message: string) {
    toast({
      title,
      message,
      duration: 5,
      preset: "error",
      backgroundColor: theme.colors.toast.error,
      titleColor: theme.colors.destructive,
      messageColor: theme.colors.destructive,
      icon: {
        tintColor: theme.colors.destructive,
      },
    });
  },
  dismiss() {
    // no support in ting for dismissing the active toast,
    // just dismiss of an active alert
  },
  dismissAlert() {
    dismissAlert();
  },
} as const;

export { Toast };
