import type { Component } from 'vue'
import {
  FileArchiveIcon,
  FileIcon,
  FileImageIcon,
  FileMusicIcon,
  FileTextIcon,
  FileVideoIcon,
  MagnetIcon,
} from '@lucide/vue'

export interface CategoryInfo {
  label: string
  icon: Component
}

// Nilai `category` dari TeraBox.
const categories: Record<number, CategoryInfo> = {
  1: { label: 'Video', icon: FileVideoIcon },
  2: { label: 'Audio', icon: FileMusicIcon },
  3: { label: 'Gambar', icon: FileImageIcon },
  4: { label: 'Dokumen', icon: FileTextIcon },
  5: { label: 'Aplikasi', icon: FileArchiveIcon },
  7: { label: 'Torrent', icon: MagnetIcon },
}

const fallback: CategoryInfo = { label: 'File', icon: FileIcon }

export function categoryInfo(category: number): CategoryInfo {
  return categories[category] ?? fallback
}

export const CATEGORY_VIDEO = 1
