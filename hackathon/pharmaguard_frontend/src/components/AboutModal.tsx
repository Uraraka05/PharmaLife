import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ open, onClose }) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-150"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <button
                  type="button"
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal/15 border border-teal/40">
                    <InformationCircleIcon className="h-5 w-5 text-teal" />
                  </div>
                  <div>
                    <Dialog.Title className="text-base sm:text-lg font-semibold text-slate-50">
                      About PharmaGuard
                    </Dialog.Title>
                    <p className="mt-1 text-xs text-slate-400">
                      Pharmacogenomics connects patient genetics with medication response to
                      personalize therapy.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                  <p>
                    <strong className="text-slate-50">PharmaGuard</strong> is a
                    rule-based pharmacogenomic risk prediction system. It analyzes VCF
                    files to identify clinically relevant variants, determines gene
                    diplotypes and phenotypes, and estimates drug safety and efficacy
                    risk.
                  </p>
                  <p>
                    The engine is aligned conceptually with{" "}
                    <span className="font-semibold text-softBlue">
                      CPIC (Clinical Pharmacogenetics Implementation Consortium)
                    </span>{" "}
                    guidance, using deterministic rules rather than machine learning. It
                    is designed to support precision prescribing decisions by highlighting
                    when standard dosing may be unsafe or ineffective.
                  </p>
                  <p>
                    This interface is intended for{" "}
                    <span className="font-semibold">educational and research use only</span>{" "}
                    and should not be used as the sole basis for clinical decisions.
                    Clinicians must consult official CPIC recommendations and local
                    institutional policies.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    No uploaded genetic data is stored; all analysis is performed
                    in-session and discarded when the page is refreshed.
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

