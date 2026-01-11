import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface LoginProps {
  readonly onLoginSuccess: (user: any) => void; // callback invoked with the authenticated user after successful login
}

// Login component: simple email/password form that uses Supabase to authenticate.
export default function Login({ onLoginSuccess }: LoginProps) {
  // State for the email input field
  const [email, setEmail] = useState('');
  // State for the password input field
  const [password, setPassword] = useState('');
  // State to indicate if login is in progress
  const [loading, setLoading] = useState(false);
  // State for error messages (null if no error)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handles the login process when the user clicks the login button
  const handleLogin = async () => {
    setErrorMessage(null); // Clear any previous error
    setLoading(true); // Show loading indicator
    // Call Supabase to sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false); // Hide loading indicator

    if (error) {
      setErrorMessage(error.message); // Show error message if login fails
      return;
    }

    if (data.user) {
      // Call the callback prop with the authenticated user
      onLoginSuccess(data.user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm flex flex-col items-center">
        {/* App title and welcome text */}
        <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-blue-100 text-4xl">
          👨‍👩‍👧‍👦
        </div>
        <h1 className="text-2xl font-bold mb-2 text-blue-700">FamilyPlanner</h1>
        <p className="mb-6 text-gray-500 text-center">Willkommen! Bitte melde dich an.</p>

        {/* Email input */}
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {/* Password input */}
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {/* Error message display */}
        {errorMessage && (
          <div className="w-full mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 text-center">
            {errorMessage}
          </div>
        )}
        {/* Login button */}
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition-colors mb-2"
          disabled={loading}
        >
          {loading ? 'Wird eingeloggt…' : 'Login'}
        </button>
      </div>
    </div>
  );
}
