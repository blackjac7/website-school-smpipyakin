declare module "*.jpg" {
  import { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}

declare module "*.png" {
  import { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}

declare module "*.svg" {
  import { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}

declare module "*.svg?url" {
  const content: any;
  export default content;
}

declare module "*.webp" {
  import { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}

declare module "*.lottie" {
  const content: string;
  export default content;
}
