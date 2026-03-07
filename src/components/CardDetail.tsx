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

  return (
    <FloatingPortal>
      <FloatingOverlay
        className="z-90 flex items-center justify-center bg-black/60"
        lockScroll
      >
        <FloatingFocusManager context={context}>
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            style={transitionStyles}
            className="relative max-w-md w-full mx-4 rounded-lg border border-border bg-bg-1 shadow-lg"
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 size-8 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-bg-2 transition-colors"
              aria-label="Close"
            >
              &times;
            </button>

            <div className="flex flex-col gap-1 p-4">
              <span className="text-lg font-bold text-text-primary">
                {card.name}
              </span>
              {card.subname && (
                <span className="text-xs italic text-text-muted">{card.subname}</span>
              )}
              <div className="text-sm text-text-secondary">
                {card.type_name}
                {card.traits && card.traits.length > 0 && (
                  <span className="text-text-muted">
                    {" "}
                    &middot; {card.traits.join(". ")}
                  </span>
                )}
              </div>
              {card.type_code === "enemy" && <EnemyStats card={card} />}
              {card.type_code === "location" && <LocationStats card={card} />}
            </div>

            {card.meta.imageId && (
              <div className="flex justify-center px-4 py-2 border-t border-border">
                <img
                  src={routes.cardImage(card.meta.imageId)}
                  className="rounded-lg border border-border w-2/3"
                  style={{ aspectRatio: isLandscape(card) ? "419/300" : "300/419" }}
                />
              </div>
            )}

            {isLandscape(card) && card.flavor && (
              <div className="px-4 py-3 text-sm italic text-text-secondary leading-relaxed border-t border-border">
                <CardText text={card.flavor} />
              </div>
            )}

            {card.text && (
              <div className="px-4 py-3 border-t border-border">
                <div className="border-l-2 border-text-muted pl-3 text-sm text-text-secondary leading-relaxed">
                  <CardText text={card.text} />
                </div>
              </div>
            )}

            {!isLandscape(card) && card.flavor && (
              <div className="px-4 py-2 text-xs italic text-text-muted border-t border-border">
                <CardText text={card.flavor} />
              </div>
            )}

            <CardKeywords card={card} className="px-4 py-2 text-sm border-t border-border" />

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
