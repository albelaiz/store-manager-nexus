
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  initialImage?: string;
  onImageChange: (imageData: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ initialImage, onImageChange }) => {
  const [previewImage, setPreviewImage] = useState<string | undefined>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB.");
      return;
    }

    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setPreviewImage(imageData);
      onImageChange(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(undefined);
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {previewImage ? (
        <div className="relative">
          <img
            src={previewImage}
            alt="Product preview"
            className="max-h-64 mx-auto rounded-md object-contain border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Click to upload an image</p>
          <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
        </div>
      )}

      {!previewImage && (
        <Button variant="outline" onClick={triggerFileInput} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
