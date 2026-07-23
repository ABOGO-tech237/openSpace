package databases

import (
	"context"
	"errors"

	"github.com/openspace/backend/internal/subscription"
)

type subscriptionAdapter struct {
	repo *subscription.Repository
}

func NewSubscriptionAdapter(repo *subscription.Repository) SubscriptionResolver {
	return &subscriptionAdapter{repo: repo}
}

func (a *subscriptionAdapter) GetActivePlan(ctx context.Context, userID string) (string, error) {
	sub, err := a.repo.FindActiveByUserID(ctx, userID)
	if err != nil {
		return "", errors.New("aucun abonnement actif")
	}
	return sub.Plan, nil
}
