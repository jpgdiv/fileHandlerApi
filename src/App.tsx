import { useState } from "react";
import "./App.css";
import { getFolderHanlder, serviceworker } from "./fileService";

function App() {
  const [image, setImage] = useState("");
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(300);
  const [imageBlob, setImageBlob] = useState<null | Blob>(null);

  return (
    <>
      <h2>fetch images</h2>
      <p>get a random img</p>
      <div>
        <img src={image} alt="" />
      </div>
      <fieldset>
        <label htmlFor="number-input">width</label>
        <input
          type="number"
          onChange={(e) => {
            setWidth(+e.target.value);
          }}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="number-input">height</label>
        <input
          type="number"
          onChange={(e) => {
            setHeight(+e.target.value);
          }}
        />
      </fieldset>
      <button
        onClick={async () => {
          const res = await fetch(`https://picsum.photos/${width}/${height}`);
          const blob = await res.blob();
          setImageBlob(blob);
          const objectURL = URL.createObjectURL(blob);
          setImage(objectURL);
        }}
      >
        give me a image
      </button>
      <button
        onClick={async () => {
          serviceworker.postMessage("store server");
          const handler = await getFolderHanlder();
          serviceworker.postMessage({ handler });
        }}
      >
        set folder handler
      </button>
      <button
        onClick={async () => {
          serviceworker.postMessage({ image: imageBlob });
        }}
      >
        store photo
      </button>
    </>
  );
}

export default App;
