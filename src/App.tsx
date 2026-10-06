import { useState, useEffect } from 'react';
import { 
  Member, 
  Meeting, 
  AttendanceRecord, 
  AthleticaConfig, 
  PointTransaction, 
  ScoreRule,
  OfficialArea 
} from './types';
import { loadData, saveData, loadSelectedArea, saveSelectedArea } from './utils/storage';
import { getMembers, upsertMember, removeMember } from './services/membersService';
import { AreaSelectionHub } from './components/AreaSelectionHub';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { LeaderboardView } from './components/LeaderboardView';
import { QuickAttendance } from './components/QuickAttendance';
import { MembersList } from './components/MembersList';

export default function App() {
  // Area Selection Hub state
  const [selectedArea, setSelectedArea] = useState<OfficialArea | 'Todas as Áreas' | null>(null);

  // Active Tab inside an Area
  const [activeTab, setActiveTab] = useState<TabKey>('attendance');

  // Application Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [config, setConfig] = useState<AthleticaConfig>({
    name: 'Atlética ESPM Rio',
    acronym: 'ESPM RIO',
    university: 'ESPM Rio - Período 26.2',
    mascot: 'Jacaré',
    minAttendancePercent: 70,
    themeColor: '#18288A',
    scoreRules: [],
  });

  // Quick feedback toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Initial load
  useEffect(() => {
    const data = loadData();
    setMembers(data.members);
    setMeetings(data.meetings);
    setAttendance(data.attendance);
    setConfig(data.config);
    setTransactions(data.transactions || []);

    // Busca membros do Supabase se configurado
    getMembers().then(fetched => {
      if (fetched && fetched.length > 0) {
        setMembers(fetched);
      }
    });

    const savedArea = loadSelectedArea();
    if (savedArea) {
      setSelectedArea(savedArea as OfficialArea | 'Todas as Áreas');
    }
  }, []);

  const handleSelectArea = (area: OfficialArea | 'Todas as Áreas') => {
    setSelectedArea(area);
    saveSelectedArea(area);
    setActiveTab('attendance');
  };

  const handleBackToAreas = () => {
    setSelectedArea(null);
    saveSelectedArea(null);
  };

  // Update Points for a single member
  const handleUpdateMemberPoints = (memberId: string, delta: number, reason: string) => {
    const updatedMembers = members.map(m => {
      if (m.id === memberId) {
        return { ...m, points: Math.max(0, (m.points || 0) + delta) };
      }
      return m;
    });

    const newTx: PointTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      memberId,
      points: delta,
      reason,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedTxs = [newTx, ...transactions];

    setMembers(updatedMembers);
    setTransactions(updatedTxs);
    saveData({ members: updatedMembers, transactions: updatedTxs });

    const memberName = members.find(m => m.id === memberId)?.name || 'Membro';
    showToast(`${delta > 0 ? `+${delta}` : delta} pontos para ${memberName}!`);
  };

  // Batch Award Points to multiple members
  const handleBatchAwardPoints = (memberIds: string[], points: number, reason: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newTxs: PointTransaction[] = [];

    const updatedMembers = members.map(m => {
      if (memberIds.includes(m.id)) {
        newTxs.push({
          id: `tx-${Date.now()}-${m.id}`,
          memberId: m.id,
          points,
          reason,
          date: today,
        });
        return { ...m, points: Math.max(0, (m.points || 0) + points) };
      }
      return m;
    });

    const updatedTxs = [...newTxs, ...transactions];

    setMembers(updatedMembers);
    setTransactions(updatedTxs);
    saveData({ members: updatedMembers, transactions: updatedTxs });

    showToast(`+${points} pontos atribuídos para ${memberIds.length} membros!`);
  };

  // Update Score Rules
  const handleUpdateScoreRules = (rules: ScoreRule[]) => {
    const updatedConfig = { ...config, scoreRules: rules };
    setConfig(updatedConfig);
    saveData({ config: updatedConfig });
    showToast('Tabela de pontuação atualizada!');
  };

  // Update Attendance with automatic points sync
  const handleUpdateAttendance = (
    newAttendance: AttendanceRecord[],
    memberPointsUpdates?: { memberId: string; delta: number; reason: string }[]
  ) => {
    setAttendance(newAttendance);

    if (memberPointsUpdates && memberPointsUpdates.length > 0) {
      let updatedMembers = [...members];
      const newTxs: PointTransaction[] = [];
      const today = new Date().toISOString().split('T')[0];

      memberPointsUpdates.forEach(update => {
        updatedMembers = updatedMembers.map(m => {
          if (m.id === update.memberId) {
            return { ...m, points: Math.max(0, (m.points || 0) + update.delta) };
          }
          return m;
        });

        newTxs.push({
          id: `tx-${Date.now()}-${update.memberId}`,
          memberId: update.memberId,
          points: update.delta,
          reason: update.reason,
          date: today,
        });
      });

      const updatedTxs = [...newTxs, ...transactions];
      setMembers(updatedMembers);
      setTransactions(updatedTxs);
      saveData({ attendance: newAttendance, members: updatedMembers, transactions: updatedTxs });
    } else {
      saveData({ attendance: newAttendance });
    }

    showToast('Presença atualizada!');
  };

  const handleAddMember = async (newMember: Member) => {
    const saved = await upsertMember(newMember);
    const updated = [saved, ...members];
    setMembers(updated);
    showToast(`Membro "${saved.name}" adicionado!`);
  };

  const handleSaveMember = async (updatedMember: Member) => {
    const saved = await upsertMember(updatedMember);
    const updated = members.map(m => (m.id === saved.id ? saved : m));
    setMembers(updated);
    showToast(`Dados de ${saved.name} atualizados!`);
  };

  const handleDeleteMember = async (memberId: string) => {
    const mem = members.find(m => m.id === memberId);
    if (!mem) return;
    if (!confirm(`Tem certeza que deseja excluir "${mem.name}" da gestão?`)) return;
    await removeMember(memberId);
    const updated = members.filter(m => m.id !== memberId);
    setMembers(updated);
    showToast(`Membro "${mem.name}" excluído da gestão.`);
  };

  // If no area is selected, render the clean initial screen!
  if (!selectedArea) {
    return (
      <AreaSelectionHub
        onSelectArea={handleSelectArea}
      />
    );
  }

  // Inside Selected Area View
  return (
    <div className="min-h-screen bg-[#040148] text-white flex flex-col font-sans selection:bg-[#18288A] selection:text-white">
      {/* Streamlined App Header */}
      <Header
        currentArea={selectedArea}
        onBackToAreas={handleBackToAreas}
      />

      {/* Navigation Bar (Chamada, Ranking, Membros) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5">
        {activeTab === 'attendance' && (
          <QuickAttendance
            members={members}
            currentArea={selectedArea}
            onRefreshAllPoints={(updatedMembers) => {
              setMembers(updatedMembers);
              saveData({ members: updatedMembers });
              getMembers().then(fetched => {
                if (fetched && fetched.length > 0) {
                  setMembers(fetched);
                }
              });
            }}
          />
        )}

        {activeTab === 'ranking' && (
          <LeaderboardView
            members={members}
            currentArea={selectedArea}
          />
        )}

        {activeTab === 'members' && (
          <MembersList
            members={members}
            currentArea={selectedArea}
            onSaveMember={handleSaveMember}
            onAddMember={handleAddMember}
            onDeleteMember={handleDeleteMember}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#090a56] border border-[#18288A] text-white px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#AAD2FF] animate-pulse" />
          {toast}
        </div>
      )}
    </div>
  );
}
