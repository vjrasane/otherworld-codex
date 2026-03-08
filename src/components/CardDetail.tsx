import { useState } from "react";
import { type Card } from "@/src/data/card";
import { routes } from "../routes";
import { CardText, CardKeywords, EnemyStats, LocationStats, isLandscape } from "./CardParts";
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";

export const CardDetail: React.FC<{
  card: Card;
  open: boolean;
  onClose: () => void;
}> = ({ card, open, onClose }) => {
  const [showBack, setShowBack] = useState(false);
  const { refs, context } = useFloating({ open, onOpenChange: (v) => !v && onClose() });

  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });
  const role = useRole(context, { role: "dialog" });

  const { getFloatingProps } = useInteractions([click, dismiss, role]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 150,
    initial: { opacity: 0, transform: "scale(0.95)" },
  });

  if (!isMounted) return null;

  const hasBack = !!card.meta.backImageId;
  const imageId = showBack ? card.meta.backImageId : card.meta.imageId;
  const name = showBack ? (card.back_name ?? card.name) : card.name;
  const text = showBack ? card.back_text : card.text;
  const flavor = showBack ? card.back_flavor : card.flavor;

  return (
    <FloatingPortal>
      <FloatingOverlay
        className="z-90 flex justify-center overflow-y-auto bg-black/60"
        style={{ paddingTop: "25vh" }}
        lockScroll
      >
        <FloatingFocusManager context={context}>
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            style={transitionStyles}
            className="relative max-w-md w-full mx-4 mb-16 self-start rounded-lg border border-border bg-bg-1 shadow-lg"
          >
            <div className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-text-primary flex-1 min-w-0 truncate">
                  {name}
                </span>
                {hasBack && (
                  <button
                    onClick={() => setShowBack((b) => !b)}
                    className="shrink-0 px-2 py-1 rounded text-xs text-text-muted hover:text-text-primary hover:bg-bg-2 transition-colors"
                  >
                    {showBack ? "Show front" : "Show back"}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="shrink-0 size-8 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-bg-2 transition-colors"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              {!showBack && card.subname && (
                <span className="text-xs italic text-text-muted">{card.subname}</span>
              )}
              <div className="text-sm text-text-secondary">
                {card.type_name}
                {!showBack && card.traits && card.traits.length > 0 && (
                  <span className="text-text-muted">
                    {" "}
                    &middot; {card.traits.join(". ")}
                  </span>
                )}
              </div>
              {!showBack && card.type_code === "enemy" && <EnemyStats card={card} />}
              {!showBack && card.type_code === "location" && <LocationStats card={card} />}
            </div>

            {imageId && (
              <div className="flex justify-center px-4 py-2 border-t border-border">
                <img
                  src={routes.cardImage(imageId)}
                  className="rounded-lg border border-border w-2/3"
                  style={{ aspectRatio: isLandscape(card) ? "419/300" : "300/419" }}
                />
              </div>
            )}

            {isLandscape(card) && flavor && (
              <div className="px-4 py-3 text-sm italic text-text-secondary leading-relaxed border-t border-border">
                <CardText text={flavor} />
              </div>
            )}

            {text && (
              <div className="px-4 py-3 border-t border-border">
                <div className="border-l-2 border-text-muted pl-3 text-sm text-text-secondary leading-relaxed">
                  <CardText text={text} />
                </div>
              </div>
            )}

            {!isLandscape(card) && flavor && (
              <div className="px-4 py-2 text-xs italic text-text-muted border-t border-border">
                <CardText text={flavor} />
              </div>
            )}

            {!showBack && <CardKeywords card={card} className="px-4 py-2 text-sm border-t border-border" />}

            <div className="flex flex-col gap-1 px-4 py-3 text-xs text-text-muted border-t border-border">
              {card.encounter_name && card.encounter_code && (
                <span className="flex items-center gap-1">
                  <img
                    src={routes.icon(card.encounter_code)}
                    className="size-4"
                  />
                  {card.encounter_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <i className="icon-cards" />
                {card.pack_name}
              </span>
              <a
                href={`https://arkhamdb.com/card/${card.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 mt-1 text-text-secondary hover:text-text-primary transition-colors"
              >
                <i className="icon-link" />
                View on ArkhamDB
              </a>
            </div>
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
};
