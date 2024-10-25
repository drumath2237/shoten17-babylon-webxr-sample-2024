import "./style.css";
import { Engine, MeshBuilder, Scene } from "@babylonjs/core";

const main = () => {
  const renderCanvas =
    document.querySelector<HTMLCanvasElement>("#renderCanvas");
  if (!renderCanvas) {
    return;
  }

  const engine = new Engine(renderCanvas);
  const scene = new Scene(engine);

  scene.createDefaultCameraOrLight(true, true, true);

  const box = MeshBuilder.CreateBox("box", { size: 0.5 });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
};

main();
