import MediaLibrary from '../MediaLibrary';

export default function MediaLibraryExample() {
  return (
    <MediaLibrary 
      onUpload={() => console.log('Upload files')}
      onSelectFile={(file) => console.log('Selected file:', file)}
    />
  );
}