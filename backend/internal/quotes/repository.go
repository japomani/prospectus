package quotes

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type Repository struct {
	client    *dynamodb.Client
	tableName string
}

func NewRepository(client *dynamodb.Client) *Repository {
	table := os.Getenv("QUOTES_TABLE")
	if table == "" {
		table = "delphinium-quotes"
	}
	return &Repository{client: client, tableName: table}
}

func (r *Repository) Put(ctx context.Context, q Quote) error {
	q.UpdatedAt = time.Now().UTC()
	item, err := attributevalue.MarshalMap(q)
	if err != nil {
		return err
	}
	_, err = r.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(r.tableName),
		Item:      item,
	})
	return err
}

func (r *Repository) Get(ctx context.Context, quoteID string) (Quote, error) {
	out, err := r.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(r.tableName),
		Key: map[string]types.AttributeValue{
			"quoteId": &types.AttributeValueMemberS{Value: quoteID},
		},
	})
	if err != nil {
		return Quote{}, err
	}
	if out.Item == nil {
		return Quote{}, fmt.Errorf("quote not found: %s", quoteID)
	}
	var q Quote
	if err := attributevalue.UnmarshalMap(out.Item, &q); err != nil {
		return Quote{}, err
	}
	return q, nil
}

func (r *Repository) ListRecent(ctx context.Context, limit int32) ([]Quote, error) {
	if limit <= 0 {
		limit = 50
	}
	out, err := r.client.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String(r.tableName),
		Limit:     aws.Int32(limit),
	})
	if err != nil {
		return nil, err
	}
	var items []Quote
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &items); err != nil {
		return nil, err
	}
	sortQuotesByUpdated(items)
	if int32(len(items)) > limit {
		items = items[:limit]
	}
	return items, nil
}

func sortQuotesByUpdated(items []Quote) {
	for i := 0; i < len(items); i++ {
		for j := i + 1; j < len(items); j++ {
			if items[j].UpdatedAt.After(items[i].UpdatedAt) {
				items[i], items[j] = items[j], items[i]
			}
		}
	}
}

func (r *Repository) ListByRep(ctx context.Context, slackUserID string, limit int32) ([]Quote, error) {
	if limit <= 0 {
		limit = 20
	}
	out, err := r.client.Scan(ctx, &dynamodb.ScanInput{
		TableName:        aws.String(r.tableName),
		FilterExpression: aws.String("slackUserId = :uid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":uid": &types.AttributeValueMemberS{Value: slackUserID},
		},
		Limit: aws.Int32(limit),
	})
	if err != nil {
		return nil, err
	}
	var items []Quote
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &items); err != nil {
		return nil, err
	}
	sortQuotesByUpdated(items)
	return items, nil
}
