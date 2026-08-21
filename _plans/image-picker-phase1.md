# Image picking — phase 1 (pick + preview, no upload)

## Context

"Choose" button in `ModalAddEditPlace.tsx` Image field must let user pick gallery image or take photo. Phase 2 (later): Cloudinary upload + wire `imageUrl`/`meta.cloudinaryId` (stubs stay `"todo"` — untouched now).

Decisions (user): `expo-image-picker`
· two buttons in form (Camera/Gallery)
· preview + remove
· native only.

## Install

```bash
pnpm expo install expo-image-picker
```

**Current state (verified in working tree)**: `expo-image-picker@~17.0.11` already installed, prebuild already run → `AndroidManifest` has `RECORD_AUDIO`, `Info.plist` has `NSCamera/NSMicrophone/NSPhotoLibrary`. Mic entries unwanted (photo-only). No `app.json` plugin entry yet.

## Files

1. `app.json`
2. `assets/global.css`
3. `components/ModalAddEditPlace.tsx`

### 1. app.json — add to `expo.plugins`

```json
[
  "expo-image-picker",
  {
    "photosPermission": "Allow ma-place to access your photos",
    "cameraPermission": "Allow ma-place to take a photo",
    "microphonePermission": false
  }
]
```

`microphonePermission: false` strips `RECORD_AUDIO` + `NSMicrophoneUsageDescription` on next prebuild (verified in plugin source; images-only camera never touches mic).

### 2. global.css — `@layer components`, after `.place-*` block

```css
.place-image-preview-wrap {
  @apply relative;
}
/* NOTE: expo-image requires width/aspect set, else it won't render */
.place-image-preview {
  @apply aspect-[4/3] w-full rounded-2xl border border-border;
}
```

### 3. ModalAddEditPlace.tsx

- Imports: `Image` from `expo-image`; `* as ImagePicker` + `type ImagePickerAsset` from `expo-image-picker`; `Pressable` from RN; `Toast` from `@/components/ui/Toast`.
- State: `const [pickedImage, setPickedImage] = useState<ImagePickerAsset | null>(null);` + `setPickedImage(null);` in existing reseed `useEffect`. Null in add AND edit mode (remote image display = phase 2).
- Handlers (no new files/hook — repo has no hooks convention):

```tsx
async function handleTakePhoto() {
  // launchCameraAsync rejects unless CAMERA granted — must request first
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Toast.error("Camera unavailable", "Allow camera access to take a photo.");
    return;
  }
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"], // SDK 54 array syntax; MediaTypeOptions deprecated
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) setPickedImage(result.assets[0]);
  } catch (err) {
    console.error("Failed to take a photo", err);
    Toast.error("Failure", "Could not take a photo. Try again.");
  }
}

async function handlePickFromGallery() {
  // System photo picker (Android Photo Picker / iOS PHPicker) needs NO permission — no request step
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) setPickedImage(result.assets[0]);
  } catch (err) {
    console.error("Failed to pick an image", err);
    Toast.error("Failure", "Could not pick an image. Try again.");
  }
}
```

- JSX — replace Choose block (lines 135-145): `flex-row gap-3` (existing footer pattern), two `Button` `className="button-secondary flex-1" classNameLabel="text-foreground"` (utility override required — Button base `text-white` beats component classes). Preview below when picked:

```tsx
{
  pickedImage && (
    <View className="place-image-preview-wrap">
      <Image
        source={{ uri: pickedImage.uri }}
        contentFit="cover"
        className="place-image-preview"
      />
      <Pressable
        className="modal-close absolute right-2 top-2"
        onPress={() => setPickedImage(null)}
      >
        <Text className="modal-close-text">✕</Text>
      </Pressable>
    </View>
  );
}
```

(✕ U+2715 same glyph as Modal close; reuses `.modal-close`/`.modal-close-text`.)

- Untouched: `handleSubmit` stubs, `canSubmit` (image optional).

## Commands (order)

```bash
pnpm expo prebuild        # strips mic perm; android/+ios/ gitignored, regenerable
pnpm lint && npx tsc --noEmit
# verify: no RECORD_AUDIO in android/app/src/main/AndroidManifest.xml; no NSMicrophone in ios/maplace/Info.plist
pnpm android              # rebuild dev client — run:android does NOT re-prebuild (android/ exists)
```

## Verification (manual, device)

- Camera: grant → photo preview; ✕ removes; deny → toast, no crash
- Gallery: opens w/o permission prompt; cancel → no-op; re-pick replaces
- Edit mode: no preview initially; reopen modal → preview cleared
- Submit works w/ and w/o image (saved place still `imageUrl: "todo"` — phase 2)
- Blank preview → restart metro `pnpm start --clear` (NativeWind CSS change)

## Notes / risks

- Prebuild regenerates gitignored native dirs — inspected: only generated content; backup first if cautious (`cp -r android android.bak ios ios.bak`).
- iOS untestable on Linux (pod install skipped); on Mac: `pnpm expo prebuild -p ios` runs pods.
- Phase 2 hook: `pickedImage` (uri/mimeType/fileSize/…) → `handleSubmit` → Cloudinary upload → real `imageUrl`/`cloudinaryId`.

## Next steps (phase 2)

1. Upload to `Claudinary` when finally calling the `addPlace` method
1. Edit mode to show a preview of existing remote `place.imageUrl`
