import { useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface SidebarNavItem {
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  exact?: boolean;
  translationKey?: string;
}

export interface SidebarSectionConfig {
  id: string;
  title: string;
  titleKey: string;
  items: SidebarNavItem[];
  defaultOpen?: boolean;
}

export interface FilteredSection {
  id: string;
  title: string;
  titleKey: string;
  items: SidebarNavItem[];
}

export interface UseSidebarSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  selectedIndex: number;
  filteredSections: FilteredSection[];
  totalResults: number;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  navigateToResult: (item: SidebarNavItem) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  clearSearch: () => void;
}

export function useSidebarSearch(sections: SidebarSectionConfig[]): UseSidebarSearchReturn {
  const [query, _setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const prevQueryRef = useRef("");

  const isSearching = query.trim().length > 0;

  const filteredSections = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const result: FilteredSection[] = [];

    for (const section of sections) {
      const sectionTitle = t(section.titleKey).toLowerCase();
      const sectionTitleMatch = sectionTitle.includes(trimmed);

      const matchedItems = section.items.filter((item) => {
        const label = t(item.translationKey || item.label).toLowerCase();
        return label.includes(trimmed);
      });

      if (matchedItems.length > 0 || sectionTitleMatch) {
        result.push({
          id: section.id,
          title: section.title,
          titleKey: section.titleKey,
          items: sectionTitleMatch ? section.items : matchedItems,
        });
      }
    }

    return result;
  }, [query, sections, t]);

  const totalResults = useMemo(() => filteredSections.reduce((sum, s) => sum + s.items.length, 0), [filteredSections]);

  // Reset selected index when query changes (avoid setState in effect)
  const setQuery = useCallback((q: string) => {
    if (q !== prevQueryRef.current) {
      prevQueryRef.current = q;
      setSelectedIndex(0);
    }
    _setQuery(q);
  }, []);

  const navigateToResult = useCallback(
    (item: SidebarNavItem) => {
      navigate(item.path);
      _setQuery("");
      prevQueryRef.current = "";
      setSelectedIndex(0);
    },
    [navigate],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isSearching) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % totalResults);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults);
          break;
        case "Enter": {
          e.preventDefault();
          // Clamp if needed
          const maxIndex = totalResults - 1;
          setSelectedIndex((current) => {
            const clamped = Math.min(current, maxIndex);
            // Find and navigate to the item at clamped index
            let flatIndex = 0;
            for (const section of filteredSections) {
              for (const item of section.items) {
                if (flatIndex === clamped) {
                  // Use setTimeout to avoid state update in render
                  setTimeout(() => navigateToResult(item), 0);
                  return clamped;
                }
                flatIndex++;
              }
            }
            return clamped;
          });
          break;
        }
        case "Escape":
          e.preventDefault();
          _setQuery("");
          prevQueryRef.current = "";
          setSelectedIndex(0);
          inputRef.current?.blur();
          break;
      }
    },
    [isSearching, totalResults, filteredSections, navigateToResult],
  );

  const clearSearch = useCallback(() => {
    _setQuery("");
    prevQueryRef.current = "";
    setSelectedIndex(0);
  }, []);

  return {
    query,
    setQuery,
    selectedIndex,
    filteredSections,
    totalResults,
    handleKeyDown,
    navigateToResult,
    inputRef,
    isSearching,
    clearSearch,
  };
}
