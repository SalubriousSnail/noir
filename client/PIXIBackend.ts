import { BackendFactory, DragDropManager } from "dnd-core";
import { IDisplayObject3d } from "pixi-projection";
import { DisplayObject, Point, Ticker } from "pixi.js";
import gsap from "gsap";

type Identifier = string | symbol;
type DisplayObject3d = DisplayObject & IDisplayObject3d;

const PIXIBackend: BackendFactory = (manager: DragDropManager) => {
  let currentObject: DisplayObject3d | null = null;
  let targetObjects: { [id: Identifier]: DisplayObject3d } = {};

  return {
    setup: () => {},
    teardown: () => {},
    profile: () => ({}),
    connectDropTarget: (targetId: Identifier, node: DisplayObject3d) => {
      targetObjects[targetId] = node;

      return () => {
        delete targetObjects[targetId];
      };
    },
    connectDragSource: (sourceId: Identifier, node: DisplayObject3d) => {
      (node as any).convertTo3d();
      let ddx = 0;
      let ddy = 0;
      let init: Point | null = null;
      let initIndex: number | null = null;
      let tween: gsap.core.Tween | null = null;

      function mouseDownListener(e: any) {
        if (currentObject == null) {
          currentObject = node;
          if (!tween?.isActive()) init = node.getGlobalPosition();
          initIndex = node.zIndex;
          node.zIndex = 100;
          node.parent.sortChildren();
          manager.getActions().beginDrag([sourceId]);

          const globalX = e.data.global.x - node.getBounds().width / 2;
          const globalY = e.data.global.y - node.getBounds().height / 2;
          const pos = node.parent.toLocal({ x: globalX, y: globalY });

          gsap.killTweensOf(node);
          tween = gsap.to(node, {
            duration: .1,
            x: pos.x,
            y: pos.y
          });
        }
      }

      function mouseMoveListener(e: MouseEvent) {
        if (currentObject == node) {
          gsap.killTweensOf(node);
          const globalX = e.x - node.getBounds().width / 2;
          const globalY = e.y - node.getBounds().height / 2;
          ddx += globalX - node.getGlobalPosition().x;
          ddy += globalY - node.getGlobalPosition().y;

          if (manager.getMonitor().isDragging()) {
            node.position.copyFrom(node.parent.toLocal({ x: globalX, y: globalY }));
          }

          const matchingTargetIds = Object.keys(targetObjects).filter((key) =>
            targetObjects[key].getBounds().contains(e.x, e.y)
          );

          manager.getActions().hover(matchingTargetIds);
        }
      }

      function mouseUpListener(e: MouseEvent) {
        if (currentObject == node) {
          currentObject = null;
          manager.getActions().drop();

          if (!manager.getMonitor().didDrop() && init) {
            const pos = node.parent.toLocal(init);
            gsap.killTweensOf(node);
            tween = gsap.to(node, {
              duration: .1,
              x: pos.x,
              y: pos.y
            });
          }

          if (initIndex) {
            node.zIndex = initIndex;
            node.parent.sortChildren();
          }

          manager.getActions().endDrag();
        }
      }

      function onTick(dt: number) {
        if (manager.getMonitor().isDragging()) {
          ddx *= 0.9;
          ddy *= 0.9;
        } else {
          ddx = ddy = 0;
        }

        ddx = Math.max(-50, Math.min(ddx, 50));
        ddy = Math.max(-50, Math.min(ddy, 50))

        node.euler.yaw = ddx / 100;
        node.euler.pitch = -ddy / 100;
      }

      node.addListener("mousedown", mouseDownListener);
      window.addEventListener("mousemove", mouseMoveListener);
      window.addEventListener("mouseup", mouseUpListener);
      Ticker.shared.add(onTick);

      return () => {
        node.removeListener("mousedown", mouseDownListener);
        window.removeEventListener("mousemove", mouseMoveListener);
        window.removeEventListener("mouseup", mouseUpListener);
        Ticker.shared.remove(onTick);
      };
    },
    connectDragPreview: (sourceId: Identifier, node: DisplayObject3d) => {
      throw "TODO";
    },
  };
};

export default PIXIBackend;
