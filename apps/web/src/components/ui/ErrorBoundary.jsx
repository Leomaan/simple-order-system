import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import logger from '../../util/logger.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Erro de renderização capturado pelo ErrorBoundary', { error: error.message, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <AlertOctagon className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-100 mb-2">Ops! Algo deu errado na exibição</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Ocorreu uma falha inesperada na tela. Não se preocupe, seus dados continuam seguros.
            </p>

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/25"
            >
              <RotateCcw className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
