import { FileDrop } from "react-file-drop";
import {
  ChangeEventHandler,
  Dispatch,
  FC,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { DocumentIcon, FolderOpenIcon } from "@heroicons/react/24/outline";

interface Props {
  setParentFile: Dispatch<SetStateAction<File | null>>;
  extensions?: string[];
}

const FileDropWrapper: FC<Props> = ({ setParentFile, extensions }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const onFileInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target as HTMLInputElement;
    if ((files as FileList).length > 0) {
      const file = (files as FileList)[0];
      setFile(file);
      setParentFile(file);
    }
    // do something with your files...
  };
  const onTargetClick = () => {
    fileInputRef.current!.click();
  };

  return (
    <div>
      <input
        onChange={onFileInputChange}
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={(extensions ?? [])
          .map((ext) => "." + ext + " ")
          .join(",")
          .trimEnd()}
      />
      <FileDrop onTargetClick={onTargetClick}>
        <div className="file-upload-container">
          {file !== null ? (
            <div className="file-uploaded">
              <DocumentIcon className="w-6 h-6 ml-1.5" />
              <div className="file-name">{file.name}</div>
            </div>
          ) : (
            <p className="file-name file-name-placeholder">
              Drag or select file
            </p>
          )}
          <div className="file-icon-container" onClick={onTargetClick}>
            <FolderOpenIcon className="file-icon" />
          </div>
        </div>
      </FileDrop>
    </div>
  );
};

export default FileDropWrapper;
