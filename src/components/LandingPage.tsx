import { Heart, Calendar, Clock, Users, CheckCircle2, ArrowRight, Sparkles, IndianRupee, MapPin, Music, Home, PartyPopper, Briefcase, ClipboardList, Presentation, Flag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Props = {
  onNavigate: (page: 'login' | 'register') => void;
};

const heroImage = 'https://images.pexels.com/photos/36652869/pexels-photo-36652869.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function LandingPage({ onNavigate }: Props) {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-maroon-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-maroon-950/80 border-b border-gold-500/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron-400 to-maroon-600 flex items-center justify-center shadow-lg shadow-saffron-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Event<span className="text-saffron-400">Planner</span></span>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <button
                onClick={() => onNavigate('login')}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 text-sm font-semibold transition-all shadow-lg shadow-saffron-500/20"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-medium text-gold-200 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 text-sm font-semibold transition-all shadow-lg shadow-saffron-500/20"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-maroon-900/40 via-maroon-950 to-maroon-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-saffron-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-gold-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron-500/10 border border-saffron-500/20 text-saffron-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Plan celebrations & office events with ease
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              Every event,
              <span className="block bg-gradient-to-r from-saffron-300 to-gold-400 bg-clip-text text-transparent">
                perfectly planned
              </span>
            </h1>
            <p className="text-lg text-gold-200/70 leading-relaxed mb-8 max-w-lg">
              From weddings to office meetings, EventPlanner helps you organize every event
              with care. Track budgets, manage guest lists, stay on top of deadlines, and
              never miss a task.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-semibold transition-all shadow-lg shadow-saffron-500/25 flex items-center gap-2"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-gold-500/20 font-semibold transition-all"
              >
                Sign In
              </button>
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-gold-200/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-saffron-400" />
                Free for everyone
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-saffron-400" />
                Made for India
              </div>
            </div>
          </div>

          {/* Hero image card */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-saffron-500/20 to-gold-500/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden border border-gold-500/20 shadow-2xl">
              <img src={heroImage} alt="Marigold garlands decoration" className="w-full h-[400px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-950 via-maroon-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gold-300 uppercase tracking-wider font-medium">Upcoming Event</p>
                    <p className="text-lg font-bold mt-0.5">Ananya &mdash; Mehndi Ceremony</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-saffron-500/20 flex items-center justify-center backdrop-blur">
                    <Clock className="w-5 h-5 text-saffron-300" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-saffron-500/20 text-saffron-200 border border-saffron-500/20">Dec 12, 2026</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gold-500/20 text-gold-200 border border-gold-500/20">150 Guests</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-gold-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">One planner for work and life</h2>
            <p className="text-gold-200/60 max-w-xl mx-auto">Tools designed for Indian families and professionals managing celebrations, office events, and time.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Celebration Planning', desc: 'Track every ritual from engagement to reception. Manage mehndi, haldi, sangeet, and the big day.', color: 'saffron' },
              { icon: Briefcase, title: 'Office Events', desc: 'Schedule meetings, conferences, trainings, and deadlines. Stay on top of every work commitment.', color: 'gold' },
              { icon: IndianRupee, title: 'Budget Tracking', desc: 'Set budgets for each event in rupees. See where your money goes across all your events.', color: 'maroon' },
              { icon: Users, title: 'Guest & Attendee Management', desc: 'Track guest counts for celebrations or attendees for meetings. Know exactly how many people to expect.', color: 'saffron' },
              { icon: CheckCircle2, title: 'Task Checklists', desc: 'Break each event into tasks like booking caterers, preparing agendas, or sending invitations.', color: 'gold' },
              { icon: Clock, title: 'Time Management', desc: 'Schedule every event with start and end times. Track status from planned to completed.', color: 'maroon' },
            ].map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl bg-white/5 border border-gold-500/10 hover:border-gold-500/25 hover:bg-white/[0.07] transition-all">
                <div className={`w-12 h-12 rounded-xl bg-${f.color}-500/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 text-${f.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gold-200/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celebration categories */}
      <section className="py-20 px-6 border-t border-gold-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/20 text-saffron-300 text-xs font-medium mb-4">
              <Heart className="w-3.5 h-3.5" />
              Celebrations
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">Plan every celebration</h2>
            <p className="text-gold-200/60 max-w-xl mx-auto">From weddings to festivals, we cover all the events that matter to your family.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { icon: Heart, label: 'Weddings' },
              { icon: Sparkles, label: 'Engagement' },
              { icon: PartyPopper, label: 'Mehndi' },
              { icon: Music, label: 'Sangeet' },
              { icon: Home, label: 'Housewarming' },
              { icon: Users, label: 'Naming Ceremony' },
              { icon: Calendar, label: 'Birthdays' },
              { icon: Heart, label: 'Anniversaries' },
              { icon: Sparkles, label: 'Festivals' },
              { icon: Clock, label: 'Puja & Rituals' },
              { icon: PartyPopper, label: 'Reception' },
              { icon: MapPin, label: 'Other' },
            ].map((cat) => (
              <div key={cat.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-gold-500/10 hover:border-saffron-500/25 hover:bg-white/[0.07] transition-all cursor-default">
                <cat.icon className="w-6 h-6 text-saffron-400" />
                <span className="text-xs text-gold-200/70 text-center font-medium">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office categories */}
      <section className="py-20 px-6 border-t border-gold-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs font-medium mb-4">
              <Briefcase className="w-3.5 h-3.5" />
              Office & Work
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">Stay on top of work events</h2>
            <p className="text-gold-200/60 max-w-xl mx-auto">Manage meetings, deadlines, and team events with the same planning power.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Users, label: 'Meetings' },
              { icon: Presentation, label: 'Conferences' },
              { icon: ClipboardList, label: 'Workshops' },
              { icon: CheckCircle2, label: 'Trainings' },
              { icon: Flag, label: 'Project Deadlines' },
              { icon: PartyPopper, label: 'Team Events' },
              { icon: Presentation, label: 'Client Presentations' },
              { icon: ClipboardList, label: 'Reviews' },
            ].map((cat) => (
              <div key={cat.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-gold-500/10 hover:border-gold-500/25 hover:bg-white/[0.07] transition-all cursor-default">
                <cat.icon className="w-6 h-6 text-gold-400" />
                <span className="text-xs text-gold-200/70 text-center font-medium">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/10 to-gold-500/10 rounded-3xl blur-3xl pointer-events-none" />
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-maroon-900 to-maroon-950/50 border border-gold-500/20">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to plan your next event?</h2>
            <p className="text-gold-200/60 mb-8 max-w-md mx-auto">Join EventPlanner today and make every celebration and work event memorable. It only takes a minute to set up.</p>
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-saffron-500 to-maroon-600 hover:from-saffron-400 hover:to-maroon-500 font-semibold transition-all shadow-lg shadow-saffron-500/25 inline-flex items-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gold-500/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gold-200/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-saffron-400 to-maroon-600 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gold-200/60">EventPlanner</span>
          </div>
          <p>Made with love for Indian families & professionals</p>
        </div>
      </footer>
    </div>
  );
}
