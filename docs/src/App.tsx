import { FC, useEffect, useState } from "react";
import "./App.css";
import FileDropWrapper from "./FileDropWrapper";
import {
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import usePatcher from "./hooks/usePatcher";
import PatcherIndicator from "./PatcherIndicator";
import { saveAs } from "file-saver";
import { getFileExtension, stripFileExtension } from "../../src/utils";

export type PatcherStatusEnum = "IDLE" | "PATCHING" | "COMPLETE" | "ERROR";

const App: FC = () => {
  const patcher = usePatcher();

  const [romFile, setRomFile] = useState<File | null>(null);

  const [patchFile, setPatchFile] = useState<File | null>(null);
  const [patchFileType, setPatchFileType] =
    useState<typeof patcher.patterns[number]>();
  const [patchFileError, setPatchFileError] = useState<boolean>(false);

  const [buttonText, setButtonText] = useState<string>("Patch & Download");
  const [patcherStatus, setPatcherStatus] = useState<PatcherStatusEnum>("IDLE");

  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent>();

  useEffect(() => {
    const installPromptEvent: any = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", installPromptEvent);

    return () => {
      window.removeEventListener("beforeinstallprompt", installPromptEvent);
    };
  }, []);

  useEffect(() => {
    if (patchFile !== null) {
      patcher
        .setPatchFile(patchFile)
        .then(() => {
          setPatchFileError(false);
          setPatchFileType(patcher.pattern);
        })
        .catch(() => {
          setPatchFileError(true);
          setPatchFileType(undefined);
        });
    }
  }, [patchFile]);

  useEffect(() => {
    if (romFile !== null) {
      patcher.setROMFile(romFile);
    }
  }, [romFile]);

  // Reset button text after 4 seconds
  useEffect(() => {
    if (patcherStatus !== "PATCHING" && patcherStatus !== "IDLE") {
      setTimeout(() => setButtonText("Patch & Download"), 4000);
    }
  }, [patcherStatus]);

  const patch = async () => {
    setPatcherStatus("PATCHING");
    setButtonText("Patching...");
    let blob: Blob;
    try {
      await patcher.loadFiles();
      patcher.parseFile();
      blob = patcher.patch().export();
    } catch (e) {
      setPatcherStatus("ERROR");
      setButtonText("ERROR: Check Console");
      console.error(e);
      return;
    }
    setPatcherStatus("COMPLETE");
    setButtonText("Downloaded to device");
    saveAs(
      blob,
      `[PATCHED]
    ${stripFileExtension(romFile?.name as string)} +
    ${stripFileExtension(patchFile?.name as string)}.${getFileExtension(
        romFile?.name as string
      )}`
    );
  };

  return (
    <div className="master">
      <h1 className="title">
        RomPatcher<span className="text-blue-500">.ts</span>
      </h1>
      <p className="font-semibold text-center">
        Zero-dependency ROM patching library
      </p>
      {installPromptEvent ? (
        <button
          className="available-offline"
          onClick={() => installPromptEvent.prompt()}
        >
          <ArrowDownTrayIcon className="h-3 w-3 mr-1.5" />
          Make Available Offline
        </button>
      ) : null}
      <div className="patcher-window">
        <p className="label mb-1">ROM file:</p>
        <FileDropWrapper setParentFile={setRomFile} />
        <p className="label mt-3 mb-1">Patch file:</p>
        <FileDropWrapper
          setParentFile={setPatchFile}
          extensions={patcher.patterns}
        />
        {patchFileError ? (
          <div className="file-type-invalid">
            <ExclamationCircleIcon className="h-5 w-5" />
            <div className="ml-1">Patch filetype not supported</div>
          </div>
        ) : null}
        <div className="type-indicator">
          {patcher.patterns.map((pattern) => (
            <div
              key={pattern}
              className={`file-type ${
                pattern === patchFileType ? "active" : ""
              }`}
            >
              {pattern}
            </div>
          ))}
        </div>
        <button
          id="patch"
          disabled={
            romFile === null ||
            patchFile === null ||
            patchFileError ||
            patcherStatus === "PATCHING"
          }
          onClick={patch}
        >
          <div className="button-pad">
            <p></p>
          </div>
          <div className="flex-1 flex-grow">{buttonText}</div>
          <div className="button-pad text-right">
            <PatcherIndicator patcherStatus={patcherStatus} />
          </div>
        </button>
      </div>
      <div className="credits">
        GPLv3 · dragonsnapx · <a href="https://github.com/dragonsnapx/rompatcher-ts">View on Github</a>
      </div>
    </div>
  );
};

export default App;
