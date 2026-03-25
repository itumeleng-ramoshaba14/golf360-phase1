export default function ClubCard({ club, onSelect }: any) {
  return (
    <div className="card">
      <h3>{club.name}</h3>
      <p className="small">{club.city}, {club.province}, {club.country}</p>
      <p>{club.description}</p>
      <button className="btn" onClick={() => onSelect(club)}>View Courses</button>
    </div>
  );
}

