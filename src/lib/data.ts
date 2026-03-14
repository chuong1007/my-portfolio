export type Project = {
  id: string;
  title: string;
  tags: string[];
  imageUrl: string;
  aspectRatio: "square" | "portrait" | "landscape";
  description: string;
  galleryImages: GalleryImage[];
};

export type GalleryImage = {
  id: string;
  url: string;
  aspectRatio: "square" | "portrait" | "landscape";
};

const SAMPLE_TAGS = ["Poster", "Branding", "Logo Design", "UX/UI"];

const ADJECTIVES = ["Modern", "Minimal", "Vibrant", "Abstract", "Bold", "Elegant", "Futuristic", "Retro", "Clean", "Dynamic"];
const NOUNS = ["Campaign", "Identity", "App", "Website", "Packaging", "Concept", "Experience", "Interface", "System", "Vision"];

const ASPECT_RATIOS: ("square" | "portrait" | "landscape")[] = ["square", "portrait", "portrait", "landscape", "portrait", "square", "landscape", "portrait"];

// Pinterest Image Sources by Category
const CATEGORY_IMAGES: Record<string, string[]> = {
  "Poster": [
    "https://i.pinimg.com/736x/47/ed/98/47ed986720f27a5301ddefbb11d34a5f.jpg",
    "https://i.pinimg.com/736x/fd/8f/b9/fd8fb9afd5044485eb8d93f32111c14a.jpg",
    "https://i.pinimg.com/736x/1a/d0/1b/1ad01b48a4fbc2a3a46f599ab78050c3.jpg",
    "https://i.pinimg.com/736x/a5/ab/17/a5ab1759ba75685e66edb3190a7b97c6.jpg"
  ],
  "Branding": [
    "https://i.pinimg.com/736x/0d/a2/46/0da246ebaeed53aa09d56c9d26d2f903.jpg",
    "https://i.pinimg.com/736x/b1/96/f5/b196f5ae4e77d2ba4b6962e80c27219b.jpg",
    "https://i.pinimg.com/736x/bb/bb/13/bbbb13a1727940d5ce3ce088ddcde27a.jpg",
    "https://i.pinimg.com/736x/44/06/7a/44067a800655d885e1cb8193488e1fb6.jpg",
    "https://i.pinimg.com/736x/37/8c/c5/378cc58b8ccc1766e2a570dedfeed63c.jpg"
  ],
  "Logo Design": [
    "https://i.pinimg.com/736x/df/51/ba/df51bae01cd310b9012c8b65de3c6b2f.jpg",
    "https://i.pinimg.com/736x/76/94/d5/7694d5ed6f6b9be1780e960e9e56eab9.jpg",
    "https://i.pinimg.com/736x/8c/15/5d/8c155d9504baf8578a580bf3e11d9d52.jpg",
    "https://i.pinimg.com/736x/d8/01/bd/d801bd116b548884bc80a2a9239be297.jpg",
    "https://i.pinimg.com/736x/67/e9/c4/67e9c45d61624e456583eaf2212fc5e2.jpg"
  ],
  "UX/UI": [
    "https://i.pinimg.com/736x/71/5b/29/715b29e0d90fe49638236099f022ed12.jpg",
    "https://i.pinimg.com/736x/fc/3b/84/fc3b84d80d7a2d5ed50ba03761813b4b.jpg",
    "https://i.pinimg.com/736x/6c/1d/69/6c1d6940e40b8167e73306ae5f10f97d.jpg",
    "https://i.pinimg.com/736x/27/b7/bb/27b7bb1f3090b29458c3f43c7f8e1529.jpg",
    "https://i.pinimg.com/736x/87/0a/03/870a03f5633e08195d83d6cfdb1c88c3.jpg"
  ]
};

const DESCRIPTIONS: string[] = [
  "Dự án thiết kế sáng tạo kết hợp giữa nghệ thuật thị giác và chiến lược thương hiệu, giúp khách hàng tạo dấu ấn mạnh mẽ trên thị trường.",
  "Bộ nhận diện thương hiệu toàn diện được xây dựng dựa trên nghiên cứu thị trường chuyên sâu và xu hướng thiết kế hiện đại.",
  "Dự án thiết kế đa nền tảng với phong cách tối giản, tập trung vào trải nghiệm người dùng và tính thẩm mỹ cao cấp.",
  "Giải pháp thiết kế đột phá mang đến diện mạo mới cho thương hiệu, kết hợp yếu tố truyền thống và hiện đại một cách sáng tạo.",
  "Thiết kế concept art và visual direction cho chiến dịch truyền thông, tạo nên câu chuyện thương hiệu đầy cảm hứng.",
];

/**
 * A simple seeded random number generator to replace Math.random()
 * so that SSR and Client hydration match perfectly.
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates gallery images for a project deterministically
 */
function generateGalleryImages(projectIndex: number, count: number = 30): GalleryImage[] {
  return Array.from({ length: count }).map((_, i) => {
    const seed = projectIndex * 100 + i + 5000;
    const aspectRatio = ASPECT_RATIOS[Math.floor(seededRandom(seed) * ASPECT_RATIOS.length)];

    let width = 800;
    let height = 800;
    if (aspectRatio === "portrait") {
      height = 1200;
    } else if (aspectRatio === "landscape") {
      height = 600;
      width = 1000;
    }

    return {
      id: `gallery-${projectIndex}-${i}`,
      url: `https://picsum.photos/seed/gallery-${projectIndex}-${i}/${width}/${height}`,
      aspectRatio,
    };
  });
}

/**
 * Generates an array of mock projects deterministically
 * @param count The number of projects to generate
 */
export function generateProjects(count: number = 100): Project[] {
  return Array.from({ length: count }).map((_, i) => {
    const id = `project-${i}`;

    // Generate a deterministic random-like number based on index
    const r1 = seededRandom(i);
    const r2 = seededRandom(i + 1000);
    const r3 = seededRandom(i + 2000);
    const r4 = seededRandom(i + 3000);

    // Generate a name
    const adjective = ADJECTIVES[Math.floor(r1 * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(r2 * NOUNS.length)];
    const title = `${adjective} ${noun}`;

    // Generate 1-2 tags
    const numTags = Math.floor(r3 * 2) + 1;
    const startIdx = Math.floor(r4 * (SAMPLE_TAGS.length - numTags + 1));
    const tags = SAMPLE_TAGS.slice(startIdx, startIdx + numTags);

    // Select an aspect ratio (just fallback metadata now)
    const aspectRatio = ASPECT_RATIOS[Math.floor(seededRandom(i + 4000) * ASPECT_RATIOS.length)];

    // Get an image that fits the primary tag
    const primaryTag = tags[0];
    const imageList = CATEGORY_IMAGES[primaryTag] || CATEGORY_IMAGES["Branding"];
    const imageUrl = imageList[i % imageList.length];

    // Pick a description deterministically
    const description = DESCRIPTIONS[Math.floor(seededRandom(i + 6000) * DESCRIPTIONS.length)];

    // Generate 30 gallery images
    const galleryImages = generateGalleryImages(i, 30);

    return {
      id,
      title,
      tags,
      imageUrl,
      aspectRatio,
      description,
      galleryImages,
    };
  });
}

// Cached project list
const ALL_PROJECTS = generateProjects(20);

/**
 * Get all projects
 */
export function getAllProjects(): Project[] {
  return ALL_PROJECTS;
}

/**
 * Get a single project by ID
 */
export function getProjectById(id: string): Project | undefined {
  return ALL_PROJECTS.find((p) => p.id === id);
}

