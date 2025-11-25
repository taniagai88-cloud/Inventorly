import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import type { AppState } from "../types";

// Import all available images
import img1 from "../assets/1c9a524adaf9b26f3aa98a6f97f0fdfa9b9f19d5.png";
import img2 from "../assets/2c489e62b99b8b4f0d5e5eca8520aa88995ac72b.png";
import img3 from "../assets/67f78ca9032fd1a83ab0f0b38575245e8a147f0c.png";
import img4 from "../assets/690d82d765bc87a642e654c45ff62e78d98609e6.png";
import img5 from "../assets/76b3695f8fd53782b957f65619ca621ff4a6454e.png";
import img6 from "../assets/7c88476d06e9bfb8e21678c9b9ce829a2c9129da.png";
import img7 from "../assets/99b2052cbb92f7d5d277ffd1cff1035b0102207f.png";
import img8 from "../assets/a76222775f9255aefbcfeeda97001c3a2820fb74.png";
import img9 from "../assets/af97294c1da1ac8535a59452f21be667a162fcff.png";
import img10 from "../assets/b45bd0da294a46d78fdbb0291d2831f3d2f293b4.png";
import img11 from "../assets/bf3e3b2adbbf51a3685ccb430cd7f99f62425330.png";
import img12 from "../assets/c3b1c63e16e2d237b57944514c694ba376985843.png";
import img13 from "../assets/c47166bb3e07ff395671cb27cc14e05ec42d5841.png";
import img14 from "../assets/f5a2d9644fffe5e34bfd23da01cfaaa2b7ee4a7a.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ImageGalleryProps {
  onNavigate: (state: AppState) => void;
  onSelectImage: (imagePath: string, imageName: string) => void;
}

const images = [
  { name: "1c9a524adaf9b26f3aa98a6f97f0fdfa9b9f19d5.png", src: img1 },
  { name: "2c489e62b99b8b4f0d5e5eca8520aa88995ac72b.png", src: img2 },
  { name: "67f78ca9032fd1a83ab0f0b38575245e8a147f0c.png", src: img3 },
  { name: "690d82d765bc87a642e654c45ff62e78d98609e6.png", src: img4 },
  { name: "76b3695f8fd53782b957f65619ca621ff4a6454e.png", src: img5 },
  { name: "7c88476d06e9bfb8e21678c9b9ce829a2c9129da.png", src: img6 },
  { name: "99b2052cbb92f7d5d277ffd1cff1035b0102207f.png", src: img7 },
  { name: "a76222775f9255aefbcfeeda97001c3a2820fb74.png", src: img8 },
  { name: "af97294c1da1ac8535a59452f21be667a162fcff.png", src: img9 },
  { name: "b45bd0da294a46d78fdbb0291d2831f3d2f293b4.png", src: img10 },
  { name: "bf3e3b2adbbf51a3685ccb430cd7f99f62425330.png", src: img11 },
  { name: "c3b1c63e16e2d237b57944514c694ba376985843.png", src: img12 },
  { name: "c47166bb3e07ff395671cb27cc14e05ec42d5841.png", src: img13 },
  { name: "f5a2d9644fffe5e34bfd23da01cfaaa2b7ee4a7a.png", src: img14 },
];

export function ImageGallery({ onNavigate, onSelectImage }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("addItem")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-6">
          Select Dining Set Image
        </h1>
        <p className="text-muted-foreground mb-8">
          Click on the dining set image to select it
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card
              key={index}
              className={`bg-card border-border elevation-sm p-4 cursor-pointer hover:elevation-md transition-shadow ${
                selectedImage === image.name ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                setSelectedImage(image.name);
                onSelectImage(image.name, image.src);
              }}
            >
              <div className="w-full h-48 bg-white rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                <ImageWithFallback
                  src={image.src}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground truncate text-center">
                {image.name}
              </p>
              {selectedImage === image.name && (
                <p className="text-xs text-primary text-center mt-1 font-medium">
                  Selected ✓
                </p>
              )}
            </Card>
          ))}
        </div>

        {selectedImage && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => {
                const selected = images.find(img => img.name === selectedImage);
                if (selected) {
                  onSelectImage(selected.name, selected.src);
                  onNavigate("addItem");
                }
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Use Selected Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
