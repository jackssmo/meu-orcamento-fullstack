import { Link } from 'react-router-dom';

export function Register() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Meu Orçamento</h1>
          <p className="text-indigo-200">Crie sua conta para começar</p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Criar Nova Conta</h2>
          
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                placeholder="Seu nome" 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input 
                type="email" 
                placeholder="seu@email.com" 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input 
                type="password" 
                placeholder="Crie uma senha" 
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
              <input 
                type="password" 
                placeholder="Confirme sua senha" 
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  id="terms-checkbox" 
                  type="checkbox" 
                  required 
                  className="w-4 h-4 border border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <label htmlFor="terms-checkbox" className="ml-2 text-sm font-medium text-gray-700">
                Eu concordo com os <a href="#" className="text-indigo-600 hover:underline">Termos de Serviço</a>.
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              Criar Conta
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Já tem uma conta? <Link to="/login" className="text-indigo-600 hover:underline font-medium">Faça Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}