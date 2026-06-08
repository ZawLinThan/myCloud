// import { fileFormat } from '@/lib/types/types';
// import { fileTypeMeta } from '../utils/dashboard.util';
// import { formatBytes } from '../utils/dashboard.util';
// import StarBorderIcon from '@mui/icons-material/StarBorder';

// interface DashboardLeftProp {
//     filteredFiles : fileFormat[];
//     type : string
//     openFileMenuKey : string | null;
//     setOpenFileMenuKey : void () => {};
// }

// const renderFileRow = (file: fileFormat, index: number) => {
//     const meta = fileTypeMeta[file.type] ?? fileTypeMeta.other;
//     const Icon = meta.icon;
//     const getFileUrl = (url: string, fileType: string) => {
//       if (['document', 'spreadsheet', 'presentation'].includes(fileType)) {
//         return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
//       }
//       return url; // images, pdf, video preview directly
//     };
//     return (
//       <div
//         key={file.key}
//         className="flex min-w-0 max-w-full items-center justify-between gap-3 px-5 py-4 transition hover:bg-black/[0.03]"
//       >
//         <a
//           className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden"
//           href={getFileUrl(file.url, file.extension ?? file.type)}
//           rel="noreferrer"
//           target="_blank"
//           title={file.name}
//         >
//           <span
//             className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${meta.tone}`}
//           >
//             <Icon fontSize="small" />
//           </span>
//           <span className="min-w-0 flex-1 overflow-hidden">
//             <span
//               className={`block max-w-full truncate font-semibold leading-5 text-app ${getFileNameSizeClass(file.name)}`}
//             >
//               {file.name}
//             </span>
//             <span className="block max-w-full truncate text-sm text-muted">
//               {meta.label}
//               {file.extension ? ` · ${file.extension}` : ''} ·{' '}
//               {formatBytes(file.size)}
//             </span>
//           </span>
//         </a>
//         {file.starred && (
//           <StarBorderIcon className="text-muted" fontSize="small" />
//         )}
//         <div className="relative shrink-0">
//           <button
//             aria-expanded={openFileMenuKey === file.key}
//             aria-label={`Open actions for ${file.name}`}
//             className="grid h-9 w-9 place-items-center rounded-md text-muted transition hover:bg-black/5 hover:text-app"
//             onClick={() =>
//               setOpenFileMenuKey((currentKey) =>
//                 currentKey === file.key ? null : file.key
//               )
//             }
//             type="button"
//           >
//             <MoreHorizRoundedIcon fontSize="small" />
//           </button>
//           {openFileMenuKey === file.key && (
//             <FileDropDownMenu
//               isDeleting={deletingFileKey === file.key}
//               onClose={() => setOpenFileMenuKey(null)}
//               onDelete={() => void handleDeleteFile(file)}
//               onShare={(method: string) => void handleShareFile(file, method)}
//               onToggleProtection={() => void handleFileStarred(file)}
//               index={index}
//             />
//           )}
//         </div>
//       </div>
//     );
//   };

// const DashboardLeft = ({
//     filteredFiles,
//     type
// }: DashboardLeftProp) => {
//     if (filteredFiles.length > 0) {
//         return (
//             <>
//                 <div className="min-w-0 divide-y divide-[var(--border)]">
//                     {visibleFiles.map((file, index) =>
//                         renderFileRow(file, index)
//                     )}
//                 </div>
//                 {filteredFiles.length > INITIAL_VISIBLE_FILE_COUNT && (
//                     <div className="border-t border-app px-5 py-4">
//                         <button
//                             className="flex h-10 w-full items-center justify-center rounded-md border border-app surface px-4 text-sm font-semibold text-accent transition hover:bg-black/5"
//                             onClick={() => setShowAllFiles((current) => !current)}
//                             type="button"
//                         >
//                             {showAllFiles
//                                 ? 'Show fewer'
//                                 : `More (${hiddenFileCount})`}
//                         </button>
//                     </div>
//                 )}
//             </>
//         )
//     } else {
//         return {

//         }
//     }
//     return
//     {

//         filteredFiles.length > 0 ? (
//             <>
//                 <div className="min-w-0 divide-y divide-[var(--border)]">
//                     {visibleFiles.map((file, index) =>
//                         renderFileRow(file, index)
//                     )}
//                 </div>
//                 {filteredFiles.length > INITIAL_VISIBLE_FILE_COUNT && (
//                     <div className="border-t border-app px-5 py-4">
//                         <button
//                             className="flex h-10 w-full items-center justify-center rounded-md border border-app surface px-4 text-sm font-semibold text-accent transition hover:bg-black/5"
//                             onClick={() => setShowAllFiles((current) => !current)}
//                             type="button"
//                         >
//                             {showAllFiles
//                                 ? 'Show fewer'
//                                 : `More (${hiddenFileCount})`}
//                         </button>
//                     </div>
//                 )}
//             </>
//         ) : (
//         <div className="px-5 py-12 text-center">
//             <span className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-[var(--surface-soft)] text-accent">
//                 <CloudDoneOutlinedIcon fontSize="medium" />
//             </span>
//             <h3 className="mt-4 text-base font-semibold text-app">
//                 {isSearching || isFilteringKind
//                     ? 'No matching files'
//                     : 'No files uploaded yet'}
//             </h3>
//             <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
//                 {isSearching || isFilteringKind
//                     ? 'Try a different search or clear the type filter.'
//                     : 'This dashboard is connected to your account and ready for the upload flow when storage actions are added.'}
//             </p>
//         </div>
//     )
//     }
// };

// export default DashboardLeft;
