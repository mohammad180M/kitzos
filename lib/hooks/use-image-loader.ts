"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useUnsavedWork } from "@/lib/unsaved-work";

export interface ImageLoaderMessages {
  invalid: string;
  loadFailed: string;
}

export function useImageLoader(imageSessionKey?: string) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageVersion, setImageVersion] = useState(0);
  const [hasImage, setHasImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWork(hasImage);

  const revokeUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const resetImage = useCallback(() => {
    revokeUrl();
    imgRef.current = null;
    setHasImage(false);
    setImageVersion((v) => v + 1);
  }, [revokeUrl]);

  const loadFile = useCallback(
    (file: File, messages: ImageLoaderMessages) => {
      if (!file.type.startsWith("image/")) {
        setError(messages.invalid);
        return;
      }
      setError(null);
      revokeUrl();
      imgRef.current = null;
      setHasImage(false);

      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setHasImage(true);
        setImageVersion((v) => v + 1);
      };
      img.onerror = () => {
        revokeUrl();
        imgRef.current = null;
        setError(messages.loadFailed);
        setHasImage(false);
        setImageVersion((v) => v + 1);
      };
      img.src = url;
    },
    [revokeUrl]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, messages: ImageLoaderMessages) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file, messages);
      e.target.value = "";
    },
    [loadFile]
  );

  useEffect(() => {
    if (!imageSessionKey) return;
    try {
      if (hasImage) sessionStorage.setItem(imageSessionKey, "1");
      else sessionStorage.removeItem(imageSessionKey);
    } catch {
      // ignored
    }
  }, [hasImage, imageSessionKey]);

  useEffect(() => () => revokeUrl(), [revokeUrl]);

  return {
    imgRef,
    inputRef,
    hasImage,
    imageVersion,
    error,
    setError,
    loadFile,
    handleInputChange,
    resetImage,
  };
}
