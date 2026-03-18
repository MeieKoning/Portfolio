import Nav from './components/Nav';
import Hero from './components/Hero';
import Projects from './components/Projects';
import QuestBoard from './components/QuestBoard';
import FlappyBird from './components/FlappyBird';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <QuestBoard />
        <FlappyBird />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
