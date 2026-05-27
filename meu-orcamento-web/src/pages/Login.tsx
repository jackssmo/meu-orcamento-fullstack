import { Link } from 'react-router-dom';

export function Login() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Meu Orçamento</h1>
          <p className="text-indigo-200">Controle suas finanças de forma simples</p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Entrar na sua Conta</h2>
          
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input 
                type="email" 
                placeholder="seu@email.com" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input 
                type="password" 
                placeholder="Sua senha" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex justify-end mt-1">
                <a href="#" className="text-sm text-indigo-600 hover:underline">Esqueceu a senha?</a>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200"
            >
              Entrar
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Não tem uma conta? <Link to="/register" className="text-indigo-600 hover:underline font-medium">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}