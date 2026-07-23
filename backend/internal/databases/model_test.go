package databases

import "testing"

func TestIsValidDBName(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  bool
	}{
		{"valid simple", "mydb", true},
		{"valid with dash", "my-app-db", true},
		{"too short", "ab", false},
		{"starts with number", "1db", false},
		{"uppercase", "MyDB", false},
		{"ends with dash", "mydb-", false},
		{"valid long", "analytics-prod-01", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := isValidDBName(tt.input); got != tt.want {
				t.Errorf("isValidDBName(%q) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}

func TestIsValidEngine(t *testing.T) {
	engines := []string{"mysql", "postgresql", "mongodb", "redis", "oracle"}
	for _, e := range engines {
		got := IsValidEngine(e)
		want := e != "oracle"
		if got != want {
			t.Errorf("IsValidEngine(%q) = %v, want %v", e, got, want)
		}
	}
}

func TestIsNoSQLEngine(t *testing.T) {
	if !IsNoSQLEngine(EngineMongoDB) {
		t.Error("mongodb should be NoSQL")
	}
	if !IsNoSQLEngine(EngineRedis) {
		t.Error("redis should be NoSQL")
	}
	if IsNoSQLEngine(EngineMySQL) {
		t.Error("mysql should be SQL")
	}
}

func TestBuildConnectionString(t *testing.T) {
	inst := &Instance{
		Engine:       EnginePostgreSQL,
		Host:         "db-host",
		Port:         5432,
		DatabaseName: "mydb",
		Username:     "user1",
	}
	cs := buildConnectionString(inst, "secret")
	if cs == "" {
		t.Fatal("expected connection string")
	}
	if !contains(cs, "postgresql://") {
		t.Errorf("unexpected connection string: %s", cs)
	}
}

func TestEncryptDecryptPassword(t *testing.T) {
	key := "test-encryption-key-32-chars!!"
	plain := "super-secret-password"
	enc, err := encryptPassword(plain, key)
	if err != nil {
		t.Fatalf("encrypt: %v", err)
	}
	dec, err := decryptPassword(enc, key)
	if err != nil {
		t.Fatalf("decrypt: %v", err)
	}
	if dec != plain {
		t.Errorf("got %q, want %q", dec, plain)
	}
}

func TestPlanQuotas(t *testing.T) {
	if PlanQuotas["starter"].MaxSQL != 1 {
		t.Error("starter should allow 1 SQL db")
	}
	if PlanQuotas["starter"].MaxNoSQL != 0 {
		t.Error("starter should not allow NoSQL")
	}
	if PlanQuotas["dev"].MaxNoSQL < 1 {
		t.Error("dev should allow NoSQL")
	}
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(sub) == 0 || indexOf(s, sub) >= 0)
}

func indexOf(s, sub string) int {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}
