import { useCallback, useEffect, useRef, useState } from "react";
import { codeService } from "../services/codeApi";
import type {
  Agency,
  CodeRecord,
  CommitteeDesignation,
  SectionChapterMetadata,
} from "../types/codebook";

export type MainView = "codes" | "definitions";

function clearBrowseMeta(
  setSection: (v: SectionChapterMetadata | null) => void,
  setDesignation: (v: SectionChapterMetadata | null) => void,
  setAgency: (v: SectionChapterMetadata | null) => void
) {
  setSection(null);
  setDesignation(null);
  setAgency(null);
}

/**
 * Shell state: navigation data, codes list, and handlers. Bootstrap uses one
 * parallel round-trip (Promise.allSettled) instead of sequential fetches.
 */
export function useCodebookApp() {
  const browseRequestIdRef = useRef(0);
  const [mainView, setMainView] = useState<MainView>("codes");
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [sectionChapterMeta, setSectionChapterMeta] =
    useState<SectionChapterMetadata | null>(null);
  const [designationMeta, setDesignationMeta] =
    useState<SectionChapterMetadata | null>(null);
  const [agencyMeta, setAgencyMeta] = useState<SectionChapterMetadata | null>(
    null
  );
  const [sections, setSections] = useState<{ section: string; title: string }[]>(
    []
  );
  const [chapters, setChapters] = useState<{ chapter: string; title: string }[]>(
    []
  );
  const [designations, setDesignations] = useState<CommitteeDesignation[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [initialBrowseLoading, setInitialBrowseLoading] = useState(true);
  const [codesBrowseLoading, setCodesBrowseLoading] = useState(false);

  const nextBrowseRequestId = useCallback(() => {
    browseRequestIdRef.current += 1;
    return browseRequestIdRef.current;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [
          codesResult,
          sectionsResult,
          chaptersResult,
          designationsResult,
          agenciesResult,
        ] = await Promise.allSettled([
          codeService.getCodes(),
          codeService.getSections(),
          codeService.getChapters(),
          codeService.getCommitteeDesignations(),
          codeService.getAgencies(),
        ]);
        if (cancelled) return;

        if (codesResult.status === "fulfilled") {
          setCodes(codesResult.value ?? []);
          clearBrowseMeta(
            setSectionChapterMeta,
            setDesignationMeta,
            setAgencyMeta
          );
        }
        if (sectionsResult.status === "fulfilled") {
          setSections(sectionsResult.value ?? []);
        }
        if (chaptersResult.status === "fulfilled") {
          setChapters(chaptersResult.value ?? []);
        }
        if (designationsResult.status === "fulfilled") {
          setDesignations(designationsResult.value ?? []);
        } else {
          setDesignations([]);
        }
        if (agenciesResult.status === "fulfilled") {
          setAgencies(agenciesResult.value ?? []);
        } else {
          setAgencies([]);
        }
      } finally {
        if (!cancelled) {
          setInitialBrowseLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSectionSelect = useCallback(
    async (sectionCode: string) => {
      const reqId = nextBrowseRequestId();
      setMainView("codes");
      setCodesBrowseLoading(true);
      setCodes([]);
      setSectionChapterMeta(null);
      setDesignationMeta(null);
      setAgencyMeta(null);
      try {
        const data = await codeService.getSectionData(sectionCode);
        if (browseRequestIdRef.current !== reqId) return;
        setCodes(data.codes ?? []);
        const cm = data.chapter_metadata;
        setSectionChapterMeta(
          cm
            ? { title: cm.title, description: cm.description ?? "" }
            : null
        );
      } catch {
        if (browseRequestIdRef.current !== reqId) return;
        setCodes([]);
        setSectionChapterMeta(null);
      } finally {
        if (browseRequestIdRef.current === reqId) {
          setCodesBrowseLoading(false);
        }
      }
    },
    [nextBrowseRequestId]
  );

  const handleDesignationSelect = useCallback(
    async (d: CommitteeDesignation) => {
      const reqId = nextBrowseRequestId();
      setMainView("codes");
      setCodesBrowseLoading(true);
      setCodes([]);
      setSectionChapterMeta(null);
      setAgencyMeta(null);
      setDesignationMeta({
        title: d.letter_tag,
        description: d.description ?? "",
      });
      try {
        const list = await codeService.getCodesByDesignation(d.letter_tag);
        if (browseRequestIdRef.current !== reqId) return;
        setCodes(list ?? []);
      } catch {
        if (browseRequestIdRef.current !== reqId) return;
        setCodes([]);
      } finally {
        if (browseRequestIdRef.current === reqId) {
          setCodesBrowseLoading(false);
        }
      }
    },
    [nextBrowseRequestId]
  );

  const handleAgencySelect = useCallback(
    async (a: Agency) => {
      const reqId = nextBrowseRequestId();
      setMainView("codes");
      setCodesBrowseLoading(true);
      setCodes([]);
      setSectionChapterMeta(null);
      setDesignationMeta(null);
      setAgencyMeta({
        title: a.agency,
        description: a.agency_info ?? "",
      });
      try {
        const enriched = await codeService.getCodesByAgency(a.agency);
        if (browseRequestIdRef.current !== reqId) return;
        setCodes((enriched ?? []).map((row) => row.code));
      } catch {
        if (browseRequestIdRef.current !== reqId) return;
        setCodes([]);
      } finally {
        if (browseRequestIdRef.current === reqId) {
          setCodesBrowseLoading(false);
        }
      }
    },
    [nextBrowseRequestId]
  );

  const handleChapterSelect = useCallback(
    async (chapterKey: string) => {
      const reqId = nextBrowseRequestId();
      setMainView("codes");
      setCodesBrowseLoading(true);
      setCodes([]);
      clearBrowseMeta(
        setSectionChapterMeta,
        setDesignationMeta,
        setAgencyMeta
      );
      try {
        const meta = await codeService.searchChapterOrAppendix(chapterKey);
        if (browseRequestIdRef.current !== reqId) return;
        const id =
          meta.chapter != null && meta.chapter !== ""
            ? String(meta.chapter)
            : meta.appendix != null && meta.appendix !== ""
              ? String(meta.appendix)
              : chapterKey;
        const list = await codeService.getCodesByChapter(id);
        if (browseRequestIdRef.current !== reqId) return;
        setCodes(list ?? []);
      } catch {
        if (browseRequestIdRef.current !== reqId) return;
        setCodes([]);
      } finally {
        if (browseRequestIdRef.current === reqId) {
          setCodesBrowseLoading(false);
        }
      }
    },
    [nextBrowseRequestId]
  );

  const codesAreaLoading = initialBrowseLoading || codesBrowseLoading;

  return {
    mainView,
    setMainView,
    codes,
    codesAreaLoading,
    sectionChapterMeta,
    designationMeta,
    agencyMeta,
    sections,
    chapters,
    designations,
    agencies,
    handleSectionSelect,
    handleChapterSelect,
    handleDesignationSelect,
    handleAgencySelect,
  };
}
