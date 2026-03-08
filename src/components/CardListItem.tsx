import { type Card } from "@/src/data/card";
import { CardThumbnail } from "./CardThumbnail";
import { CardPreview } from "./CardPreview";
import { CardDetail } from "./CardDetail";
import { useCallback, useRef, useState } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
  useTransitionStyles,
} from "@floating-ui/react";

export const CardListItem: React.FC<{ card: Card }> = ({ card }) => {
  const [hovered, setHovered] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { refs, floatingStyles, context } = useFloating({
    open: hovered,
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 150,
    initial: { opacity: 0 },
  });

  const onMouseEnter = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setHovered(true), 200);
  }, []);

  const onMouseLeave = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setHovered(false);
  }, []);

  return (
    <>
      <div
        ref={refs.setReference}
        className="flex items-center gap-2 py-1.5 px-2 border-b border-border cursor-pointer"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={() => setDetailOpen(true)}
      >
        <CardThumbnail card={card} size="sm" className="border border-border" />

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-text-primary truncate">
            {card.name}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-text-muted truncate">
            <span>{card.type_name}</span>
            {card.encounter_name && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="truncate">{card.encounter_name}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, ...transitionStyles, zIndex: 80 }}
          >
            <CardPreview card={card} />
          </div>
        </FloatingPortal>
      )}
      <CardDetail
        card={card}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
};
